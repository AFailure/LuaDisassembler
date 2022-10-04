const fs = require('fs')
const { exec } = require('child_process')
const { time, Console } = require('console')

// const outputPath = './output.lua'

const OpFormat = require('./formats.js')
/*
const OpFormat = [
    'AB', 'ABx', 'ABC', 'AB', 'AB', 
    'ABx', 'ABC', 'ABx', 'AB', 'ABC', 
    'ABC', 'ABC', 'ABC', 'ABC', 'ABC', 
    'ABC', 'ABC', 'ABC','AB', 'AB', 'AB', 
    'ABC', 'sBx', 'ABC', 'ABC', 'ABC', 
    'AC', 'ABC', 'ABC', 'ABC', 'AB', 'AsBx', 
    'AsBx', 'AC', 'ABC', 'A', 'ABx', 'AB'
]
*/


const SignedHalf = 1023
const u32 = 2 ** 32

function BitRange(Bit, Start, End = 0) {
    return (Bit & (1 << Start) - 1) >> End
}

function Disassemble(Bytecode) {
    // let Bytecode = Bytecode

    let IntSize
    let StringIntSize
    let LuaIntSize
    let Endianness

    function oneByte() {
        const Byte = Bytecode.charCodeAt(0)
        Bytecode = Bytecode.slice(1)
        return Byte
    }

    function getString() {
        let Size = 0
        let Raw
        // let StringBytes = []

        const LenBytes = Bytecode.slice(0, StringIntSize)
        
        for(let i=0; i < StringIntSize; i++) {
            Size += LenBytes.charCodeAt(i)
        }
        Bytecode = Bytecode.slice(StringIntSize)
        /*for(i=0; i < Size; i++) {
            const Char = Bytecode.charAt(i)
            StringBytes.push(Char)
        }*/
        Raw = Bytecode.slice(0, Size-1)
        
        Bytecode = Bytecode.slice(Size)
        return {
            Size: Size,
            RawString: Raw,
            // StringBytes: StringBytes
        }
    }

    function Bits32() {
        const B1 = Bytecode.charCodeAt(0), 
              B2 = Bytecode.charCodeAt(1),
              B3 = Bytecode.charCodeAt(2),
              B4 = Bytecode.charCodeAt(3);
              Bytecode = Bytecode.slice(4)

        let float = Endianness == 1 &&
            (B4 * 2 ** 24) + (B3 << 16) + (B2 << 8) + B1 // Little endian
            ||
            (B1 * 2 ** 24) + (B2 << 16) + (B3 << 8) + B4 // Big endian (default)

        return float
    }

    function Bits64() {
        const 
            B1 = Bytecode.charCodeAt(0), B2 = Bytecode.charCodeAt(1),
            B3 = Bytecode.charCodeAt(2), B4 = Bytecode.charCodeAt(3),
            B5 = Bytecode.charCodeAt(4), B6 = Bytecode.charCodeAt(5),
            B7 = Bytecode.charCodeAt(6), B8 = Bytecode.charCodeAt(7)
            Bytecode = Bytecode.slice(8)

        // u32 required because of 32 bit bitwise operation limitation
        let float = Endianness == 1 &&
            (B8 * 2 ** 56) + (B7 << 48) * u32 + (B6 << 40) * u32 + (B5 * u32) + (B4 * 2 ** 24) + (B3 << 16) + (B2 << 8) + B1 // Little endian
            ||
            (B1 * 2 ** 56) + (B2 << 48) * u32 + (B3 << 40) * u32 + (B4 * u32) + (B5 * 2 ** 24) + (B6 << 16) + (B7 << 8) + B8 // Big endian


        return float
    }

    function getInt() {
        if(IntSize > 4) {
            return Bits64()
        }
        return Bits32()
    }

    function Single() {
        let B1, B2, B3, B4

        if (Endianness == 1) {
            B1 = Bytecode.charCodeAt(3), B2 = Bytecode.charCodeAt(2),
            B3 = Bytecode.charCodeAt(1), B4 = Bytecode.charCodeAt(0)
        } else {
            B1 = Bytecode.charCodeAt(0), B2 = Bytecode.charCodeAt(1),
            B3 = Bytecode.charCodeAt(2), B4 = Bytecode.charCodeAt(3)
        }
        
        const Sign = B1 >> 7
        const Exp  = ((B1 & 127) << 1) + (B2 & 128)
        const Main = ((B2 & 127) << 16) + (B3 << 8) + B4

        if (Exp == 0 && Main == 0) {
            return (-1) ** Sign * 0
        } else if (Exp == 255) {
            if(Main == 1) {
                return 0/0
            }

            return (-1) ** Sign * (1/0)
        }

        return (-1) ** Sign * (2 ** (Exp - 127)) * (1 + Main / (1 << 23))
    }

    function Double() {
        let B1, B2, B3, B4, B5, B6, B7, B8

        if (Endianness == 1) {
            B1 = Bytecode.charCodeAt(7), B2 = Bytecode.charCodeAt(6),
            B3 = Bytecode.charCodeAt(5), B4 = Bytecode.charCodeAt(4),
            B5 = Bytecode.charCodeAt(3), B6 = Bytecode.charCodeAt(2),
            B7 = Bytecode.charCodeAt(1), B8 = Bytecode.charCodeAt(0)
        } else {
            B1 = Bytecode.charCodeAt(0), B2 = Bytecode.charCodeAt(1),
            B3 = Bytecode.charCodeAt(2), B4 = Bytecode.charCodeAt(3),
            B5 = Bytecode.charCodeAt(4), B6 = Bytecode.charCodeAt(5),
            B7 = Bytecode.charCodeAt(6), B8 = Bytecode.charCodeAt(7)
            
        } Bytecode = Bytecode.slice(8)

        const Sign = B1 >> 7
        const Exp  = ((B1 & 127) << 4) + (B2 >> 4)
        const Main = ((B2 & 15) << 48) * u32 + (B3 << 40) * u32 + (B4 * u32) + (B5 * 2 ** 24) + (B6 << 16) + (B7 << 8) + B8

        if (Exp == 0 && Main == 0) {
            return (-1) ** Sign * 0
        } else if (Exp == 2047) {
            if (Main == 1 || Main >> 0 == -1) {
                return 0/0
            }

            return (-1) ** Sign * (1/0)
        }

        return (-1) ** Sign * (2 ** (Exp - SignedHalf)) * (1 + Main / (2 ** 52))
    }

    function GetInstructions() {
        const InstructionAmount = getInt()
        const Instructions = []


        for(let i=0; i < InstructionAmount; i++) {
            const RegisterData = {}
            const base10 = getInt()
            const OpCode = BitRange(base10, 6)
            const Format = OpFormat[OpCode] // Temp for testing
            
            const A = BitRange(base10, 14, 6), 
                  B = BitRange(base10, 31, 23), 
                  C = BitRange(base10, 23, 14), 
                  Bx = BitRange(base10, 31, 14)

            if(Format != 'sBx') RegisterData.A = A

            switch(Format) {
                case 'ABC':
                    RegisterData.B = B
                    RegisterData.C = C
                    break
                case 'AB': 
                    RegisterData.B = B
                    break
                case 'AC':
                    RegisterData.C = C
                    break
                case 'ABx':
                    RegisterData.Bx = Bx
                    break
                case 'AsBx':
                    RegisterData.sBx = Bx - (262143 >> 1)
                case 'sBx':

                    RegisterData.sBx = Bx - (262143 >> 1)
            }
            
            Instructions.push({
                OpCode: OpCode,
                // opn: OpCodes[OpCode],
                Format: Format,
                Registers: RegisterData
            })
        }

        return Instructions
    }

    function GetConstants() {
        const Constants = []
        const ConstCount = getInt()

        for(let i=0; i < ConstCount; i++) {
            const ConstType = oneByte()
            const Data = {Const: null, ConstType: ConstType}

            switch(ConstType) {
                case 1: 
                    const Bool = oneByte()
                    Data.Const = (Bool == 1)
                    break
                case 3:
                    const Int = Double()
                    Data.Const = Int
                    break
                case 4:
                    const String = getString()
                    Data.Const = String.RawString
                    // break
            }

            Constants.push(Data)
        }

        return Constants
    }

    function sourcePosList() {
        const _len = getInt()
        const positionList = []
        
        for (let i = 0; i < _len; i++) { positionList.push(getInt()) }
        
        return positionList
    }

    function LocalsList() {
        const _len = getInt()
        const LList = []
        
        for (let i = 0; i < _len; i++) {
            LList.push({
                name: getString().RawString,
                startpc: getInt(),
                endpc: getInt()
            })
        }

        return LList
    }

    function getUpvalues() {
        const _len = getInt()
        const upvalues = []

        for (let i = 0; i < _len; i++) {
            upvalues.push(getString().RawString)
        }

        return upvalues
    }

    // Main 

    function FunctionChunk() {
        const Main = {
            SourceName: getString().RawString, // String (aids when its a proto, just binary string of chunk, might shorten.)
            LineDefined: getInt(), // Int
            LastLineDefined: getInt(), // Int
            NumberOfUpvals: oneByte(), // Byte
            NumberOfParameters: oneByte(), // Byt 
            VarArgFlag: oneByte(), // Byte
            MaxStack: oneByte(), // Byte
            Instructions: GetInstructions(), // List
            Constants: GetConstants(),
            Protos: [],
            LinePos: {},
            Locals: {},
            Upvalues: {}
        }

        const protoCount = getInt()

        for(let i = 0; i < protoCount; i++) {
            const protoTest = FunctionChunk();
            Main.Protos.push(protoTest)
        }
        
        Main.LinePos = sourcePosList()
        Main.Locals = LocalsList()
        Main.Upvalues = getUpvalues()

        return Main
    }

    const Sig = Bytecode.slice(1, 4); Bytecode = Bytecode.slice(4)

    const Header = {
        Signature: Sig,
        Version: oneByte(),
        FormatVersion: oneByte(),
        EndianFlag: oneByte(),
        SizeInt: oneByte(),
        SizeT: oneByte(),
        SizeInstruct: oneByte(),
        LuaNumber: oneByte(),
        IntegralFlag: oneByte()
    }

    IntSize = Header.SizeInt
    StringIntSize = Header.SizeT
    LuaIntSize = Header.LuaNumber
    Endianness = Header.EndianFlag

    const mainChunk = FunctionChunk()
    return [Header, mainChunk]
}

/*
const { formatOutput } = require('./formatter.js')

exec('luac input.lua', (error, stdout, stderr) => {
    const test = fs.readFileSync('luac.out', 'binary')
    const d_start = Date.now()
    const [ header, mainChunk ] = Disassemble(test)

    console.log(JSON.stringify(mainChunk))

    formatOutput(header, mainChunk, './output.lua', (Date.now() - d_start) / 1000)
})

*/

module.exports = { Disassemble: Disassemble }