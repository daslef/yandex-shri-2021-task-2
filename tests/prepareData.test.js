const fs = require('fs')
const equal = require('fast-deep-equal');

const { prepareData } = require('../build/index')

const trueOutput = JSON.parse(fs.readFileSync('data/output.json'));

// const input = JSON.parse(fs.readFileSync('data/input.json'));
const input = require('../data/input.json');


test('succesfully exported', () => {
    expect(prepareData).toBeDefined();
})

test('should return empty array on empty input', () => {
    expect(prepareData([], { sprintId: 1 })).toStrictEqual([]);
})

test('array should contain data on future sprint', () => {
    const output = prepareData(input, { sprintId: 996 })
    expect(output).toHaveLength(5)
    for (const slide of output) {
        expect(slide).toHaveProperty('data')
    }
})

test('should be equal to output.json for sprintId 977', () => {
    const output = prepareData(input, { sprintId: 977 })
    expect(equal(output, trueOutput)).toEqual(true)
})
