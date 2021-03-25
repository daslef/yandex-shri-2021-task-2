// const fs = require('fs');

class Slide {

    constructor(data, id) {
        this.data = data
        this.currentSprintId = id
        this.currentSprint = {}
        this.sprints = []
        this.users = []
        this.commits = []
        this.summaries = []
        this.comments = []
    }

    parseData() {
        this.data.map(obj => {
            if (obj.type == 'User') {
                this.users.push(obj)
            } else if (obj.type == 'Sprint') {
                if (obj.id == this.currentSprintId) {
                    this.currentSprint = obj
                }
                this.sprints.push(obj)
            } else if (obj.type == 'Commit') {
                this.commits.push(obj)
            } else if (obj.type == 'Summary') {
                this.summaries.push(obj)
            } else if (obj.type == 'Comment') {
                this.comments.push(obj)
            }
        })
    }
    
    templateLeaders(users) {
        return {
            "alias": "leaders",
            "data": {
              "title": "Больше всего коммитов",
              "subtitle": this.currentSprint.name,
              "emoji": "👑",
              "users": users
            }
        }
    }

    templateChart(commitsData, usersData) {
        return {
            "alias": "chart",
            "data": {
              "title": "Коммиты",
              "subtitle": this.currentSprint.name,
              "values": commitsData,
              "users": usersData
            }
        }
    }

    templateDiagram(currentCommits, previousCommits, diffCategories) {

        const total = currentCommits.length
        const difference = total - previousCommits.length

        return {
            "alias": "diagram",
            "data": {
              "title": "Размер коммитов",
              "subtitle": this.currentSprint.name,
              "totalText": this.textProcessed(total, 'diagram'),
              "differenceText": `${difference} с прошлого спринта`,
              "categories": this.textProcessed(diffCategories, 'diagram')
            }
          }
    }

    templateActivity(activity) {
        return {
            "alias": "activity",
            "data": {
              "title": "Коммиты",
              "subtitle": this.currentSprint.name,
              "data": activity
            }
          }
    }

    templateVote(users) {
        return {
            "alias": "vote",
            "data": {
              "title": "Самый 🔎 внимательный разработчик",
              "subtitle": this.currentSprint.name,
              "emoji": "🔎",
              "users": this.textProcessed(users, 'vote')
            }
          }
    }

    textProcessed(data, template) {

        const wordForms = template === 'vote' ? ['голос', 'голоса', 'голосов']
            : template === 'diagram' ? ['коммит', 'коммита', 'коммитов'] 
            : []

        const postfix = (numeral) => {

            let i = Math.abs(Number(numeral)) % 100

            if (i >= 11 && i <= 19) {
                return `${numeral} ${wordForms[2]}`
            }

            i = i % 10
            const postfix = (i == 1) ? wordForms[0] : (i >= 2 && i <= 4) ? wordForms[1] : wordForms[2]
            return `${numeral} ${postfix}`

        } 

        if (template === 'vote') {
            return data.map(obj => ({ ...obj, valueText: postfix(obj.valueText) }))
        }

        if (template === 'diagram') {

            if (!(data instanceof Object)) {
                return postfix(data)
            }

            return data.map(({ title, valueText, differenceText }) => {
                return { 
                    title, 
                    valueText: postfix(valueText),
                    differenceText: postfix(differenceText)
                }
            })
        }
    }

    getSprintMetadata(sprintId) {
        return this.sprints.filter(sprint => sprint.id == sprintId)[0]
    }
    
    getSprintCommits(sprintId) {
        const { startAt: sprintStartAt, finishAt: sprintFinishAt } = this.getSprintMetadata(sprintId)
        return this.commits.filter(o => (o.timestamp >= sprintStartAt) && (o.timestamp < sprintFinishAt))
    }

    // в summaries только id или могут быть и объекты?
    getCommitSummaries(commit) {
        const commitSummaries = []
        commit.summaries.map(summaryId => {
            commitSummaries.push(this.summaries.filter(obj => obj.id == summaryId)[0])
        })
        return commitSummaries
    }

    getCommitDiff(commit) {
        const commitSummaries = this.getCommitSummaries(commit)
        const commitDiff = []
        commitSummaries.map(summary => {
            commitDiff.push(summary.added + summary.removed)
        })
        return commitDiff
    }

    getSprintDiffs(sprintCommits) {
        const sprintDiffs = []
        sprintCommits.map(commit => {
            sprintDiffs.push(this.getCommitDiff(commit))
        })
        return sprintDiffs
            .map(commitDiffs => commitDiffs.reduce((acc, cur) => acc + cur, 0))
    }

    getSprintLikes(comments) {
        const likesByUser = {}
        comments.map(comment => {
            if (!Object.keys(likesByUser).includes(`${comment.author}`)) {
                likesByUser[comment.author] = comment.likes.length
            } else {
                likesByUser[comment.author] += comment.likes.length
            }
        })

        const leaders = []
        Object.entries(likesByUser)
            .sort((a, b) => b[1] - a[1])
            .map(([userId, value]) => {
                const { id, name, avatar } = this.users.filter(user => user.id == userId)[0]
                leaders.push({ "id": id, "name": name, "avatar": avatar, "valueText": value.toString() })
            })
        return leaders
    }

    getSprintComments(sprintId) {
        const { startAt: sprintStartAt, finishAt: sprintFinishAt } = this.getSprintMetadata(sprintId)
        return this.comments.filter(o => (o.createdAt >= sprintStartAt) && (o.createdAt < sprintFinishAt))
    }

    getSprintLeaders(sprintCommits) {
        const commitsByUser = {}
        sprintCommits.map(commit => {
            if (!Object.keys(commitsByUser).includes(`${commit.author}`)) {
                commitsByUser[commit.author] = 1
            } else {
                commitsByUser[commit.author]++ 
            }
        })

        const leaders = []
        Object.entries(commitsByUser)
            .sort((a, b) => b[1] - a[1])
            .map(([userId, value]) => {
                const { id, name, avatar } = this.users.filter(user => user.id == userId)[0]
                leaders.push({ "id": id, "name": name, "avatar": avatar, "valueText": value.toString() })
            })
        return leaders
    }

    getActivity(commits) {

        const activity = [
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0),
            new Array(24).fill(0)
        ]

        commits.map(commit => {
            const date = new Date(commit.timestamp)
            const dayOfWeek = date.getDay()
            const hour = Number(date.getHours())
            activity[dayOfWeek][hour]++
        })

        return {
            "sun": activity[0],
            "mon": activity[1],
            "tue": activity[2],
            "wed": activity[3],
            "thu": activity[4],
            "fri": activity[5],
            "sat": activity[6],
        }
    }

    compareSprintCommits() {
        const comparison = []
        this.sprints.map(sprint => {
            const sprintObject = {
                title: sprint.id.toString(),
                hint: sprint.name,
                value: this.getSprintCommits(sprint.id).length
            }
            if (sprint.id == this.currentSprintId) {
                sprintObject.active = true
            }
            comparison.push(sprintObject)
        })
        return comparison.sort((a, b) => parseInt(a.title) - parseInt(b.title))
    }

    compareSprintDiffs(currentSprintDiffs, previousSprintDiffs) {
        
        const categories = [
            { title: "> 1001 строки", currentSprintCount: 0, previousSprintCount: 0},
            { title: "501 — 1000 строк", currentSprintCount: 0, previousSprintCount: 0 },
            { title: "101 — 500 строк", currentSprintCount: 0, previousSprintCount: 0 },
            { title: "1 — 100 строк", currentSprintCount: 0, previousSprintCount: 0 }
        ]

        for (const diff of currentSprintDiffs) {
            if (diff >= 1001) {
                categories[0]['currentSprintCount']++
            } else if (diff >= 501) {
                categories[1]['currentSprintCount']++
            } else if (diff >= 101) {
                categories[2]['currentSprintCount']++
            } else if (diff >= 1) {
                categories[3]['currentSprintCount']++
            }
        }

        for (const diff of previousSprintDiffs) {
            if (diff >= 1001) {
                categories[0]['previousSprintCount']++
            } else if (diff >= 501) {
                categories[1]['previousSprintCount']++
            } else if (diff >= 101) {
                categories[2]['previousSprintCount']++
            } else if (diff >= 1) {
                categories[3]['previousSprintCount']++
            }
        }

        return categories.map(({ title, currentSprintCount, previousSprintCount }) => {
            return { 
                title, 
                valueText: currentSprintCount, 
                differenceText: currentSprintCount - previousSprintCount
            }
        })

    }


    prepare() {

        this.parseData()

        const currentCommits = this.getSprintCommits(this.currentSprintId)
        const currentSprintDiffs = this.getSprintDiffs(currentCommits)
        const currentSprintComments = this.getSprintComments(this.currentSprintId)
        const currentSprintLikes = this.getSprintLikes(currentSprintComments)
        const currentSprintLeaders = this.getSprintLeaders(currentCommits)
        const currentSprintActivity = this.getActivity(currentCommits)

        const previousCommits = this.getSprintCommits(this.currentSprintId - 1)
        const previousSprintDiffs = this.getSprintDiffs(previousCommits)

        const sprintsCommitsComparison = this.compareSprintCommits()

        const diffCategories = this.compareSprintDiffs(currentSprintDiffs, previousSprintDiffs)

        const vote = this.templateVote(currentSprintLikes)
        const leaders = this.templateLeaders(currentSprintLeaders)
        const chart = this.templateChart(sprintsCommitsComparison, currentSprintLeaders)
        const diagram = this.templateDiagram(currentCommits, previousCommits, diffCategories)
        const activity = this.templateActivity(currentSprintActivity)

        return [vote, leaders, chart, diagram, activity]
    }

}


function prepareData(entities, { sprintId }) {
    slide = new Slide(entities, sprintId)
    const data = slide.prepare()
    // fs.writeFileSync('test.json', JSON.stringify(data));
    return data
}

// let rawData = fs.readFileSync('input.json');
// let data = JSON.parse(rawData);
// prepareData(data, { sprintId: 977 })


module.exports = { prepareData }