# LuaDisassembler

A disassembler for compiled **[Lua](https://www.lua.org/)** code in **[JavaScript](https://nodejs.org/en/)**

![Image](https://cdn.discordapp.com/attachments/343412326914850827/1026658147122823328/output.png)

## What does it do?
LuaDisassembler allows you to input a binary file of a compiled Lua chunk and outputs intelligible data which can be formatted, used to decompile into psuedo code, or used for general analysis of the program. The disassembler unpacks headers, function headers, instructions, constants, prototype chunks and addtional debug information (upvalues list, local list, and source position list) if avaliable. Currently, only supports [double](https://en.wikipedia.org/wiki/Double-precision_floating-point_format) and [single](https://en.wikipedia.org/wiki/Single-precision_floating-point_format) precision float data types from the [IEEE754 standard](https://en.wikipedia.org/wiki/IEEE_754) with Litte and Big endian formats for general binary encoding.

## How to use
First you need to have a binary file that you want to disassemble. This can be done using **[luac](https://www.lua.org/manual/5.1/luac.html)** on a terminal. Using `luac [filename].lua` will compile the code inside the file and generate a binary file `luac.out`.

Requiring `/main/index.js` will return an object with a `Disassemble` function. The function takes a binary string from a compiled Lua chunk. Returns `[Chunk header <object>, Main function block <object>]`. Using Node's `File system` library, you can read the binary file and disassemble it.

Chunk header:
```js
{
    Signature: 'Lua', // 4 Bytes
    Version: 81,      // 1 Byte...
    FormatVersion: 0,
    EndianFlag: 1,
    SizeInt: 4,
    SizeT: 4,
    SizeInstruct: 4,
    LuaNumber: 8,
    IntegralFlag: 0
}
```

Basic function block:
```js
{
    SourceName: '@input.lua',
    LineDefined: 0,
    LastLineDefined: 0,
    NumberOfUpvals: 0,
    NumberOfParameters: 0,
    VarArgFlag: 2,
    MaxStack: 3,
    Instructions: [
        { OpCode: 1, Format: 'ABx', Registers: { A: 0, Bx: 0 } },
        { OpCode: 36, Format: 'ABx', Registers: { A: 1, Bx: 0 } },
        { OpCode: 7, Format: 'ABx', Registers: { A :1, Bx: 1 } },
        { OpCode: 5, Format: 'ABx', Registers: { A: 1, Bx: 2 } },
        { OpCode: 0, Format: 'AB', Registers: { A: 2, B: 0 } },
        { OpCode: 28, Format: 'ABC', Registers: { A: 1, B: 2, C: 1 } },
        { OpCode: 30, Format: 'AB', Registers: { A: 0, B: 1 } }
    ],
    Constants: [
        { Const: 3, ConstType: 3 },
        { Const: 'testFunction', ConstType: 4 },
        { Const: 'print', ConstType: 4 }
    ],
    Protos: [
        {
            SourceName: '\x03\x00\x00\x00\x05\x00\x00...',
            LineDefined: 3,  
            LastLineDefined: 5,
            NumberOfUpvals: 0,
            NumberOfParameters: 3,
            VarArgFlag: 0,
            MaxStack: 4,
            Instructions: [Array],
            Constants: [Array],
            Protos: [],
            LinePos: [Array],
            Locals: [Array],
            Upvalues: []
        }
    ],
    LinePos: [
        1, 5, 3, 7,
        7, 7, 7
    ],
    Locals: [ { name: 'test', startpc: 1, endpc: 6 } ],
    Upvalues: []
}
```

## Examples

Basic example:
```js
const { Disassemble } = require('./main/index.js')
const fs = require('fs')

const binaryString = fs.readFileSync('luac.out', 'binary')
const [ header, mainChunk ] = Disassemble(binaryString)
```

With formatter:
```js
formatOutput(header <object>, mainBlock <object>, path <string>, timeElasped <number>)
```

```js
const { formatOutput } = require('./main/formatter.js')
const { Disassemble }  = require('./main/index.js')
const fs = require('fs')

const binaryString = fs.readFileSync('luac.out', 'binary')
const d_start = Date.now()
const [ header, mainChunk ] = Disassemble(binaryString)

formatOutput(header, mainChunk, './output.lua', (Date.now() - d_start) / 1000)
```