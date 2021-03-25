const fs = require('fs')
const { prepareData } = require('../build/index')

let data = JSON.parse(fs.readFileSync('tests/input.json'));
fs.writeFileSync('tests/test.json', JSON.stringify(prepareData(data, { sprintId: 986 })));