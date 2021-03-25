const fs = require('fs')
const { prepareData } = require('../build/index')

let data = JSON.parse(fs.readFileSync('tests/input.json'));
data = prepareData(data, { sprintId: 986 })
fs.writeFileSync('tests/test.json', JSON.stringify(data));