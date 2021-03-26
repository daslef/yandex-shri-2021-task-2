const fs = require('fs')
const equal = require('fast-deep-equal');

const { prepareData } = require('../build/index')

const input = JSON.parse(fs.readFileSync('tests/input.json'));

const output = prepareData(input, { sprintId: 977 })
const trueOutput = JSON.parse(fs.readFileSync('tests/output.json'));

if (!equal(output, trueOutput)) {
    console.error('Equal comparison failed')
}