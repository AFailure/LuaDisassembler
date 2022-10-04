// This file is for testing purposes only, this will not go onto the repo

const { Disassemble } = require('./main/index.js')
const fs = require('fs')

const binaryString = fs.readFileSync('./main/luac.out', 'binary')
const [ header, mainChunk ] = Disassemble(binaryString)

console.log(mainChunk)