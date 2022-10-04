const fs = require('fs')
const constTypes = require('./types.js')
const OpCodes = require('./opcodes.js')

function formatString(str) {
    str = str.replace(/"/g, '\"'); str = str.replace(/'/g, '\''); str = str.replace(/\n/g, '\\n')

    return str
}

function formatOutput(header, data, path, timeElapsed) {
    let indent = -1

    fs.writeFileSync(path, `Disasssembled in: ${timeElapsed}s
[${header.Signature} | ${header.FormatVersion==0 && 'Official Version' || 'Unofficial Version'} | ${header.EndianFlag==0 && 'Big Endian' || 'Little Endian'}]
    
Integer Size: ${header.SizeInt} Bytes\nString Int Size: ${header.SizeT} Bytes\nInstruction Size: ${header.SizeInstruct} Bytes\nLua number: ${header.LuaNumber}\n\n
`)
    function chunk(chunkData) {
        const
            Instructions = chunkData.Instructions,
            Constants = chunkData.Constants,
            Protos = chunkData.Protos,
            LinePositions = chunkData.LinePos,
            Locals = chunkData.Locals,
            Upvalues = chunkData.Upvalues

        const
            InstL = Instructions.length.toString().length, ConstL = Constants.length.toString().length,
            ProtosL = Protos.length.toString().length, LinePosL = LinePositions.length.toString().length,
            LocL = Locals.length.toString().length, UpvalL = Upvalues.length.toString().length

        let appendData = ''
        
        indent++

        // Instructions
        fs.appendFileSync(path, '\t'.repeat(indent) + `Instructions[${Instructions.length}]:\n`)
        
        // string interpolatioin makes hard to read and just ugly
        for(let i = 0; i < Instructions.length; i++) {
            const cInstruction = Instructions[i], opCode = cInstruction.OpCode, opName = OpCodes[opCode]

            appendData
            += ('\t').repeat(indent)
            + `[${i}]`
            + (' ').repeat(InstL - i.toString().length + 2)
            + opName
            + (' ').repeat(12 - opName.length)
            + `[${opCode}]`
            + (opCode > 9 && ' ' || '  ')
            + `${JSON.stringify(cInstruction.Registers).replace(/\"\w+\":/g, ' ')}\n`
        }
        
        // Constants
        fs.appendFileSync(path, `${appendData}\n\n${('\t').repeat(indent)}Constants[${Constants.length}]:\n`); appendData = ''

        for(let i = 0; i < Constants.length; i++) {
            const Const = Constants[i], constType = constTypes[Const.ConstType]
            let rawConst = Const.Const;if(Const.ConstType == 4) rawConst = `\"${formatString(rawConst)}\"`
            
            appendData
            += ('\t').repeat(indent)
            + `[${i}]`
            + (' ').repeat(ConstL - i.toString().length + 2)
            + constType
            + (' ').repeat(12 - constType.length)
            + ` [${Const.ConstType}]  ${rawConst}\n`
        }

        /*
        fs.appendFileSync(outputPaht, `${appendData}\n\n${'\t'.repeat(indent)}Line Positions[${LinePositions.length}]}]`); appendData = ''

        for(let i = 0; i < LinePositions.length; i++) {
            const positionData = LinePositions[i]
            
            appendData += ('\t').repeat(indent) + 
        }
        */

        fs.appendFileSync(path, `${appendData}\n\n${'\t'.repeat(indent)}Locals[${Locals.Length}]:\n`); appendData = ''

        for(let i = 0; i < Locals.length; i++) {
            const Local = Locals[i]

            appendData
            += ('\t').repeat(indent)
            + Local.name
            + '\t'
            + `[${Local.startpc} => ${Local.endpc}]\n`
        }

        fs.appendFileSync(path, `${appendData}\n\n${'\t'.repeat(indent)}Upvalues[${Upvalues.length}]:\n\n`); appendData = ''

        for(let i = 0; i < Upvalues.length; i++) {
            appendData
            += ('\t').repeat(indent)
            + `[${i}]`
            + (' ').repeat(UpvalL - i.toString().length + 2)
            + Upvalues[i]
            + '\n'
        }

        fs.appendFileSync(path, appendData)

        for(let i = 0; i < Protos.length; i++) {
            const protoChunkData = Protos[i]
            
            fs.appendFileSync(path, '\t'.repeat(indent) + `Proto [${i}] => {\n`)
            chunk(protoChunkData)
            fs.appendFileSync(path, '\t'.repeat(indent) + '}\n\n')
        }

        indent--
    }

    chunk(data)
}

module.exports = {
    formatOutput: formatOutput
}