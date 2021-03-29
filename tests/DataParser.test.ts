import DataParser from '../src/dataParser'
const input = require('../data/input.json');

const parser = new DataParser(input, 980)


describe.each([
    [958, 'first sprint'],
    [997, 'intermediate sprint'],
    [991, 'current sprint'],
    [996, 'empty sprint']
  ])('should parse data', (sprintId, name) => {

    test(`should loads data (${name})`, () => {
        parser.reset()
        parser.currentSprintId = sprintId
        parser.parseData();
        expect(parser.data).toStrictEqual(input)
    });

    test('should parse users', () => {
        parser.reset()
        parser.currentSprintId = sprintId
        parser.parseData();
        expect(parser.users).toBeDefined()
        expect(parser.users.length).toBeGreaterThan(0)
    });

    test('should parse sprints', () => {
        parser.reset()
        parser.currentSprintId = sprintId
        parser.parseData();
        expect(parser.sprints).toBeDefined()
        expect(parser.sprints.length).toBeGreaterThan(0)
    });

    test('should parse commits', () => {
        parser.reset()
        parser.currentSprintId = sprintId
        parser.parseData();
        expect(parser.commits).toBeDefined()
        expect(parser.commits.length).toBeGreaterThan(0)
    });

    test('should parse summaries', () => {
        parser.reset()
        parser.currentSprintId = sprintId
        parser.parseData();
        expect(parser.summaries).toBeDefined()
        expect(parser.summaries.length).toBeGreaterThan(0)
    });

    test('should parse comments', () => {
        parser.reset()
        parser.currentSprintId = sprintId
        parser.parseData();
        expect(parser.comments).toBeDefined()
        expect(parser.comments.length).toBeGreaterThan(0)
    });

    test('should filter comments', () => {
        parser.reset()
        parser.currentSprintId = sprintId
        parser.parseData();
        const commentsLengthBeforeFilter = parser.comments.length
        parser.filterComments()
        expect(parser.comments.length).toBeLessThan(commentsLengthBeforeFilter)
    });

    test('should filter commits', () => {
        parser.reset()
        parser.currentSprintId = sprintId
        parser.parseData();
        parser.filterCommits()
        expect(parser.previousSprintCommits).toBeDefined();
        expect(parser.currentSprintCommits).toBeDefined();
    });

});


test('should get sprint metadata', () => {
    parser.parseData();
    const output = parser.getSprintMetadata(982)
    expect(output).toBeDefined()
    expect(output).toStrictEqual({
        "id": 982,
        "type": "Sprint",
        "name": "F5",
        "startAt": 1606597502000,
        "finishAt": 1607202302000
    })
});



// getCommitSummaries(commit) {
//     return commit.summaries.map(summaryId => {
//         return this.summaries.filter((obj) => obj.id == summaryId)[0];
//     });
// }
// getCommitDiff(commit) {
//     return this
//         .getCommitSummaries(commit)
//         .map(summary => summary.added + summary.removed);
// }
// getSprintDiffs(sprintCommits) {
//     return sprintCommits
//         .map(commit => this.getCommitDiff(commit))
//         .map(commitDiffs => commitDiffs.reduce((acc, cur) => acc + cur, 0));
// }