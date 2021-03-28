const fs = require('fs')
const equal = require('fast-deep-equal');

const { prepareData } = require('../build/index')

const input = JSON.parse(fs.readFileSync('data/input.json'));

const output = prepareData(input, { sprintId: 977 })
console.log(output)
// const trueOutput = JSON.parse(fs.readFileSync('data/output.json'));

// if (!equal(output, trueOutput)) {
//     console.error('Equal comparison failed')
// }