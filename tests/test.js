const fs = require('fs')
const { prepareData } = require('../src/index')

let data = JSON.parse(fs.readFileSync('tests/input.json'));
fs.writeFileSync('tests/test.json', JSON.stringify(prepareData(data, { sprintId: 991 })));