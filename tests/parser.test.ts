import DataParser from '../src/dataParser'

const input = require('../data/input.json');

const parser = new DataParser(input, 980)

describe('dataParser testing on intermediate sprint', () => {
    
    test('should loads data', () => {
        parser.parseData();
        expect(parser.data).toStrictEqual(input)
    });

    test('should parse users', () => {
        parser.parseData();
        expect(parser.users).toBeDefined()
        expect(parser.users.length).toBeGreaterThan(0)
    });

    test('should parse sprints', () => {
        parser.parseData();
        expect(parser.sprints).toBeDefined()
        expect(parser.sprints.length).toBeGreaterThan(0)
    });

    test('should parse commits', () => {
        parser.parseData();
        expect(parser.commits).toBeDefined()
        expect(parser.commits.length).toBeGreaterThan(0)
    });

    test('should parse summaries', () => {
        parser.parseData();
        expect(parser.summaries).toBeDefined()
        expect(parser.summaries.length).toBeGreaterThan(0)
    });

    test('should parse comments', () => {
        parser.parseData();
        expect(parser.comments).toBeDefined()
        expect(parser.comments.length).toBeGreaterThan(0)
    });

    test('should filter comments', () => {
        parser.parseData();
        const commentsLengthBeforeFilter = parser.comments.length
        parser.filterComments()
        expect(parser.comments.length).toBeLessThan(commentsLengthBeforeFilter)
    });

    test('should filter commits', () => {
        parser.parseData();
        parser.filterCommits()
        expect(parser.previousSprintCommits).toBeDefined();
        expect(parser.currentSprintCommits).toBeDefined();
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

    test('should get commit diff', () => {
        parser.parseData();
        
    })

});
