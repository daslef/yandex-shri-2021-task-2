'use strict';

class DataParser {
    constructor(data, id) {
        this.users = [];
        this.sprints = [];
        this.commits = [];
        this.summaries = [];
        this.comments = [];
        this.currentSprintCommits = [];
        this.previousSprintCommits = [];
        this.data = data;
        this.currentSprintId = id;
    }
    parseData() {
        this.data.map(obj => {
            if (obj.type == 'User') {
                this.users.push(obj);
            }
            else if (obj.type == 'Sprint') {
                if (obj.id == this.currentSprintId) {
                    this.currentSprint = obj;
                }
                this.sprints.push(obj);
            }
            else if (obj.type == 'Commit') {
                this.commits.push(obj);
            }
            else if (obj.type == 'Summary') {
                this.summaries.push(obj);
            }
            else if (obj.type == 'Comment') {
                this.comments.push(obj);
            }
        });
    }
    filterComments() {
        const { startAt, finishAt } = this.getSprintMetadata(this.currentSprintId);
        this.comments = this.comments.filter(o => (o.createdAt >= startAt) && (o.createdAt < finishAt));
    }
    filterCommits() {
        this.currentSprintCommits = this.getSprintCommits(this.currentSprintId);
        this.previousSprintCommits = this.getSprintCommits(this.currentSprintId - 1);
    }
    getSprintMetadata(sprintId) {
        const filteredSprints = this.sprints.filter((sprint) => sprint.id == sprintId)
        if (filteredSprints.length === 0) {
            return { startAt: null, finishAt: null}
        }
        return filteredSprints[0];
    }
    getSprintCommits(sprintId) {
        const { startAt, finishAt } = this.getSprintMetadata(sprintId);
        if (!startAt || !finishAt) {
            return []
        }
        return this.commits.filter((o) => {
            return (o.timestamp >= startAt) && (o.timestamp < finishAt);
        });
    }
    getCommitSummaries(commit) {
        return commit.summaries.map(summaryId => {
            return this.summaries.filter((obj) => obj.id == summaryId)[0];
        });
    }
    getCommitDiff(commit) {
        return this
            .getCommitSummaries(commit)
            .map(summary => summary.added + summary.removed);
    }
    getSprintDiffs(sprintCommits) {
        return sprintCommits
            .map(commit => this.getCommitDiff(commit))
            .map(commitDiffs => commitDiffs.reduce((acc, cur) => acc + cur, 0));
    }
    getSprintLeaders(data, category) {
        const groupByUser = {};
        const leaders = [];
        data.map((obj) => {
            const index = obj.author instanceof Object
                ? obj.author.id.toString()
                : obj.author.toString();
            if (!Object.keys(groupByUser).includes(index)) {
                if (category == 'commits') {
                    groupByUser[index] = 1;
                }
                else {
                    groupByUser[index] = obj.likes.length;
                }
            }
            else {
                if (category == 'commits') {
                    groupByUser[index]++;
                }
                else {
                    groupByUser[index] += obj.likes.length;
                }
            }
        });
        Object.entries(groupByUser)
            .sort((a, b) => b[1] - a[1])
            .map(([userId, value]) => {
            const user = this.users.filter((user) => user.id.toString() == userId)[0];
            leaders.push({ "id": user.id, "name": user.name, "avatar": user.avatar, "valueText": value.toString() });
        });
        return leaders;
    }
    getActivity() {
        const activity = [
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0)
        ];
        this.currentSprintCommits.map(commit => {
            const date = new Date(commit.timestamp);
            const dayOfWeek = date.getDay();
            const hour = Number(date.getHours());
            activity[dayOfWeek][hour]++;
        });
        return {
            "sun": activity[0],
            "mon": activity[1],
            "tue": activity[2],
            "wed": activity[3],
            "thu": activity[4],
            "fri": activity[5],
            "sat": activity[6],
        };
    }
    compareSprintCommits() {
        const comparison = this.sprints.map(sprint => {
            const obj = {
                title: sprint.id.toString(),
                hint: sprint.name,
                value: this.getSprintCommits(sprint.id).length
            };
            if (sprint.id == this.currentSprintId) {
                obj.active = true;
            }
            return obj;
        });
        return comparison.sort((a, b) => parseInt(a.title) - parseInt(b.title));
    }
    compareSprintDiffs() {
        const currentSprintDiffs = this.getSprintDiffs(this.currentSprintCommits);
        const previousSprintDiffs = this.getSprintDiffs(this.previousSprintCommits);
        const categories = [
            { title: "> 1001 строки", currentSprintCount: 0, previousSprintCount: 0 },
            { title: "501 — 1000 строк", currentSprintCount: 0, previousSprintCount: 0 },
            { title: "101 — 500 строк", currentSprintCount: 0, previousSprintCount: 0 },
            { title: "1 — 100 строк", currentSprintCount: 0, previousSprintCount: 0 }
        ];
        for (const diff of currentSprintDiffs) {
            if (diff >= 1001) {
                categories[0]['currentSprintCount']++;
            }
            else if (diff >= 501) {
                categories[1]['currentSprintCount']++;
            }
            else if (diff >= 101) {
                categories[2]['currentSprintCount']++;
            }
            else if (diff >= 1) {
                categories[3]['currentSprintCount']++;
            }
        }
        for (const diff of previousSprintDiffs) {
            if (diff >= 1001) {
                categories[0]['previousSprintCount']++;
            }
            else if (diff >= 501) {
                categories[1]['previousSprintCount']++;
            }
            else if (diff >= 101) {
                categories[2]['previousSprintCount']++;
            }
            else if (diff >= 1) {
                categories[3]['previousSprintCount']++;
            }
        }
        return categories.map(({ title, currentSprintCount, previousSprintCount }) => {
            return {
                title,
                valueText: currentSprintCount.toString(),
                differenceText: (currentSprintCount - previousSprintCount).toString()
            };
        });
    }
    get votes() {
        return this.getSprintLeaders(this.comments, 'likes');
    }
    get leaders() {
        return this.getSprintLeaders(this.currentSprintCommits, 'commits');
    }
    get activity() {
        return this.getActivity();
    }
    get chart() {
        return this.compareSprintCommits();
    }
    get diagram() {
        return {
            current: this.currentSprintCommits.length,
            previous: this.previousSprintCommits.length,
            categories: this.compareSprintDiffs()
        };
    }
    get subtitle() {
        return this.currentSprint.name;
    }
    prepare() {
        this.parseData();
        this.filterComments();
        this.filterCommits();
    }
}

class Template {
    static templateLeaders(subtitle, users) {
        return {
            alias: "leaders",
            data: {
                title: "Больше всего коммитов",
                subtitle: subtitle,
                emoji: "👑",
                users: users
            }
        };
    }
    static templateChart(subtitle, commitsData, usersData) {
        return {
            alias: "chart",
            data: {
                title: "Коммиты",
                subtitle: subtitle,
                values: commitsData,
                users: usersData
            }
        };
    }
    static templateDiagram(subtitle, data) {
        const { current, previous, categories } = data;
        const difference = current - previous;
        return {
            alias: "diagram",
            data: {
                title: "Размер коммитов",
                subtitle: subtitle,
                totalText: this.textProcessed(current, 'diagram'),
                differenceText: `${difference > 0 ? '+' : ''}${difference} с прошлого спринта`,
                categories: this.textProcessed(categories, 'diagram')
            }
        };
    }
    static templateActivity(subtitle, activity) {
        return {
            alias: "activity",
            data: {
                title: "Коммиты",
                subtitle: subtitle,
                data: activity
            }
        };
    }
    static templateVote(subtitle, users) {
        return {
            alias: "vote",
            data: {
                title: "Самый 🔎 внимательный разработчик",
                subtitle: subtitle,
                emoji: "🔎",
                users: this.textProcessed(users, 'vote')
            }
        };
    }
    static textProcessed(data, template) {
        const wordForms = template === 'vote' ? ['голос', 'голоса', 'голосов']
            : template === 'diagram' ? ['коммит', 'коммита', 'коммитов']
                : [];
        const postfix = (numeral) => {
            let i = Math.abs(Number(numeral)) % 100;
            if (i >= 11 && i <= 19) {
                return `${numeral} ${wordForms[2]}`;
            }
            i = i % 10;
            const postfix = (i == 1) ? wordForms[0] : (i >= 2 && i <= 4) ? wordForms[1] : wordForms[2];
            return `${numeral} ${postfix}`;
        };
        const processDiagramText = (data) => {
            if (!(data instanceof Object)) {
                return postfix(data);
            }
            return data.map(({ title, valueText, differenceText }) => {
                const prefix = Number(differenceText) > 0 ? '+' : '';
                return {
                    title,
                    valueText: postfix(valueText),
                    differenceText: prefix.concat(postfix(differenceText))
                };
            });
        };
        const processVoteText = (data) => {
            if (!(data instanceof Array)) {
                return []
            }
            return data.map(obj => (Object.assign(Object.assign({}, obj), { valueText: postfix(obj.valueText) })));
        };
        if (template === 'vote') {
            return processVoteText(data);
        }
        else if (template === 'diagram') {
            return processDiagramText(data);
        }
    }
}

(function (exports) {
    function prepareData(entities, { sprintId }) {
        if (entities.length == 0 || sprintId == undefined) {
            return [];
        }
        
        const parser = new DataParser(entities, sprintId);
        parser.prepare();

        const subtitle = parser.subtitle;
        const vote = Template.templateVote(subtitle, parser.votes);
        const leaders = Template.templateLeaders(subtitle, parser.leaders);
        const chart = Template.templateChart(subtitle, parser.chart, parser.leaders);
        const diagram = Template.templateDiagram(subtitle, parser.diagram);
        const activity = Template.templateActivity(subtitle, parser.activity);
        return [leaders, vote, chart, diagram, activity];
    }

    if (typeof window !== 'undefined' || typeof self !== 'undefined') {
        window.prepareData = prepareData
    }

    exports.prepareData = prepareData;
    
})(typeof exports === 'undefined' ? this['index'] = {} : exports);
