const prepareData = require('../build/index').prepareData;

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