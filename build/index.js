'use strict';

var DataParser = (function () {
    function DataParser(data, id) {
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
    DataParser.prototype.parseData = function () {
        var _this = this;
        this.data.map(function (obj) {
            if (obj.type == 'User') {
                _this.users.push(obj);
            }
            else if (obj.type == 'Sprint') {
                if (obj.id == _this.currentSprintId) {
                    _this.currentSprint = obj;
                }
                _this.sprints.push(obj);
            }
            else if (obj.type == 'Commit') {
                _this.commits.push(obj);
            }
            else if (obj.type == 'Summary') {
                _this.summaries.push(obj);
            }
            else if (obj.type == 'Comment') {
                _this.comments.push(obj);
            }
        });
    };
    DataParser.prototype.filterComments = function () {
        var _a = this.getSprintMetadata(this.currentSprintId), startAt = _a.startAt, finishAt = _a.finishAt;
        this.comments = this.comments.filter(function (o) { return (o.createdAt >= startAt) && (o.createdAt < finishAt); });
    };
    DataParser.prototype.filterCommits = function () {
        this.currentSprintCommits = this.getSprintCommits(this.currentSprintId);
        this.previousSprintCommits = this.getSprintCommits(this.currentSprintId - 1);
    };
    DataParser.prototype.getSprintMetadata = function (sprintId) {
        return this.sprints.filter(function (sprint) { return sprint.id == sprintId; })[0];
    };
    DataParser.prototype.getSprintCommits = function (sprintId) {
        var _a = this.getSprintMetadata(sprintId), startAt = _a.startAt, finishAt = _a.finishAt;
        return this.commits.filter(function (o) {
            return (o.timestamp >= startAt) && (o.timestamp < finishAt);
        });
    };
    DataParser.prototype.getCommitSummaries = function (commit) {
        var _this = this;
        return commit.summaries.map(function (summaryId) {
            return _this.summaries.filter(function (obj) { return obj.id == summaryId; })[0];
        });
    };
    DataParser.prototype.getCommitDiff = function (commit) {
        return this
            .getCommitSummaries(commit)
            .map(function (summary) { return summary.added + summary.removed; });
    };
    DataParser.prototype.getSprintDiffs = function (sprintCommits) {
        var _this = this;
        return sprintCommits
            .map(function (commit) { return _this.getCommitDiff(commit); })
            .map(function (commitDiffs) { return commitDiffs.reduce(function (acc, cur) { return acc + cur; }, 0); });
    };
    DataParser.prototype.getSprintLeaders = function (data, category) {
        var _this = this;
        var groupByUser = {};
        var leaders = [];
        data.map(function (obj) {
            var index = obj.author instanceof Object
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
            .sort(function (a, b) { return b[1] - a[1]; })
            .map(function (_a) {
            var userId = _a[0], value = _a[1];
            var user = _this.users.filter(function (user) { return user.id.toString() == userId; })[0];
            leaders.push({ "id": user.id, "name": user.name, "avatar": user.avatar, "valueText": value.toString() });
        });
        return leaders;
    };
    DataParser.prototype.getActivity = function () {
        var activity = [
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0)
        ];
        this.currentSprintCommits.map(function (commit) {
            var date = new Date(commit.timestamp);
            var dayOfWeek = date.getDay();
            var hour = Number(date.getHours());
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
    };
    DataParser.prototype.compareSprintCommits = function () {
        var _this = this;
        var comparison = this.sprints.map(function (sprint) {
            var obj = {
                title: sprint.id.toString(),
                hint: sprint.name,
                value: _this.getSprintCommits(sprint.id).length
            };
            if (sprint.id == _this.currentSprintId) {
                obj.active = true;
            }
            return obj;
        });
        return comparison.sort(function (a, b) { return parseInt(a.title) - parseInt(b.title); });
    };
    DataParser.prototype.compareSprintDiffs = function () {
        var currentSprintDiffs = this.getSprintDiffs(this.currentSprintCommits);
        var previousSprintDiffs = this.getSprintDiffs(this.previousSprintCommits);
        var categories = [
            { title: "> 1001 строки", currentSprintCount: 0, previousSprintCount: 0 },
            { title: "501 — 1000 строк", currentSprintCount: 0, previousSprintCount: 0 },
            { title: "101 — 500 строк", currentSprintCount: 0, previousSprintCount: 0 },
            { title: "1 — 100 строк", currentSprintCount: 0, previousSprintCount: 0 }
        ];
        for (var _i = 0, currentSprintDiffs_1 = currentSprintDiffs; _i < currentSprintDiffs_1.length; _i++) {
            var diff = currentSprintDiffs_1[_i];
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
        for (var _a = 0, previousSprintDiffs_1 = previousSprintDiffs; _a < previousSprintDiffs_1.length; _a++) {
            var diff = previousSprintDiffs_1[_a];
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
        return categories.map(function (_a) {
            var title = _a.title, currentSprintCount = _a.currentSprintCount, previousSprintCount = _a.previousSprintCount;
            return {
                title: title,
                valueText: currentSprintCount.toString(),
                differenceText: (currentSprintCount - previousSprintCount).toString()
            };
        });
    };
    Object.defineProperty(DataParser.prototype, "votes", {
        get: function () {
            return this.getSprintLeaders(this.comments, 'likes');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataParser.prototype, "leaders", {
        get: function () {
            return this.getSprintLeaders(this.currentSprintCommits, 'commits');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataParser.prototype, "activity", {
        get: function () {
            return this.getActivity();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataParser.prototype, "chart", {
        get: function () {
            return this.compareSprintCommits();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataParser.prototype, "diagram", {
        get: function () {
            return {
                current: this.currentSprintCommits.length,
                previous: this.previousSprintCommits.length,
                categories: this.compareSprintDiffs()
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataParser.prototype, "subtitle", {
        get: function () {
            return this.currentSprint.name;
        },
        enumerable: false,
        configurable: true
    });
    DataParser.prototype.prepare = function () {
        this.parseData();
        this.filterComments();
        this.filterCommits();
    };
    return DataParser;
}());

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var Template = (function () {
    function Template() {
    }
    Template.templateLeaders = function (subtitle, users) {
        return {
            "alias": "leaders",
            "data": {
                "title": "Больше всего коммитов",
                "subtitle": subtitle,
                "emoji": "👑",
                "users": users
            }
        };
    };
    Template.templateChart = function (subtitle, commitsData, usersData) {
        return {
            "alias": "chart",
            "data": {
                "title": "Коммиты",
                "subtitle": subtitle,
                "values": commitsData,
                "users": usersData
            }
        };
    };
    Template.templateDiagram = function (subtitle, data) {
        var current = data.current, previous = data.previous, categories = data.categories;
        var difference = current - previous;
        return {
            "alias": "diagram",
            "data": {
                "title": "Размер коммитов",
                "subtitle": subtitle,
                "totalText": this.textProcessed(current, 'diagram'),
                "differenceText": "" + (difference > 0 ? '+' : '') + difference + " \u0441 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u0441\u043F\u0440\u0438\u043D\u0442\u0430",
                "categories": this.textProcessed(categories, 'diagram')
            }
        };
    };
    Template.templateActivity = function (subtitle, activity) {
        return {
            "alias": "activity",
            "data": {
                "title": "Коммиты",
                "subtitle": subtitle,
                "data": activity
            }
        };
    };
    Template.templateVote = function (subtitle, users) {
        return {
            "alias": "vote",
            "data": {
                "title": "Самый 🔎 внимательный разработчик",
                "subtitle": subtitle,
                "emoji": "🔎",
                "users": this.textProcessed(users, 'vote')
            }
        };
    };
    Template.textProcessed = function (data, template) {
        var wordForms = template === 'vote' ? ['голос', 'голоса', 'голосов']
            : template === 'diagram' ? ['коммит', 'коммита', 'коммитов']
                : [];
        var postfix = function (numeral) {
            var i = Math.abs(Number(numeral)) % 100;
            if (i >= 11 && i <= 19) {
                return numeral + " " + wordForms[2];
            }
            i = i % 10;
            var postfix = (i == 1) ? wordForms[0] : (i >= 2 && i <= 4) ? wordForms[1] : wordForms[2];
            return numeral + " " + postfix;
        };
        var processDiagramText = function (data) {
            if (!(data instanceof Object)) {
                return postfix(data);
            }
            return data.map(function (_a) {
                var title = _a.title, valueText = _a.valueText, differenceText = _a.differenceText;
                var prefix = Number(differenceText) > 0 ? '+' : '';
                return {
                    title: title,
                    valueText: postfix(valueText),
                    differenceText: prefix.concat(postfix(differenceText))
                };
            });
        };
        var processVoteText = function (data) {
            return data.map(function (obj) { return (__assign(__assign({}, obj), { valueText: postfix(obj.valueText) })); });
        };
        if (template === 'vote') {
            return processVoteText(data);
        }
        else if (template === 'diagram') {
            return processDiagramText(data);
        }
    };
    return Template;
}());

function prepareData(entities, _a) {
    var sprintId = _a.sprintId;
    var parser = new DataParser(entities, sprintId);
    parser.prepare();
    var subtitle = parser.subtitle;
    var vote = Template.templateVote(subtitle, parser.votes);
    var leaders = Template.templateLeaders(subtitle, parser.leaders);
    var chart = Template.templateChart(subtitle, parser.chart, parser.leaders);
    var diagram = Template.templateDiagram(subtitle, parser.diagram);
    var activity = Template.templateActivity(subtitle, parser.activity);
    return [leaders, vote, chart, diagram, activity];
}
module.exports = { prepareData: prepareData };
