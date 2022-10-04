module.exports = [
    'MOVE',
    'LOADK', 'LODABOOL', 'LOADNIL', // Loads
    'GETUPVAL', 'GETGLOBAL', 'GETTABLE', // Get
    'SETGLOBAL', 'SETUPVAL', 'SETTABLE', // Set
    'NEWTABLE',
    'SELF',
    'ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'POW', 'UNM', 'NOT', 'LEN', 'CONCAT', // Operators
    'JMP', 'EQ', 'LT', 'LE', 'TEST', 'TESTSET', // Conditions
    'CALL', 'TAILCALL', 'RETURN', // Functions
    'FORLOOP', 'FORPREP', 'TFORLOOP', // Iteration
    'SETLIST', 'CLOSE', 'CLOSURE', 'VARARG' // Other
]