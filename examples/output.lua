Disasssembled in: 0.002s
[Lua | Official Version | Little Endian]
    
Integer Size: 4 Bytes
String Int Size: 4 Bytes
Instruction Size: 4 Bytes
Lua number: 8


Instructions[7]:
[0]  LOADK       [1]  { 0, 0}
[1]  CLOSURE     [36] { 1, 0}
[2]  SETGLOBAL   [7]  { 1, 1}
[3]  GETGLOBAL   [5]  { 1, 2}
[4]  MOVE        [0]  { 2, 0}
[5]  CALL        [28] { 1, 2, 1}
[6]  RETURN      [30] { 0, 1}


Constants[3]:
[0]  LUAT_TNUMBER [3]  3
[1]  LUA_TSTRING  [4]  "testFunction"
[2]  LUA_TSTRING  [4]  "print"


Locals[undefined]:
test	[1 => 6]


Upvalues[0]:

Proto [0] => {
	Instructions[3]:
	[0]  LOADK       [1]  { 3, 0}
	[1]  RETURN      [30] { 3, 2}
	[2]  RETURN      [30] { 0, 1}


	Constants[1]:
	[0]  LUA_TSTRING  [4]  "function return"


	Locals[undefined]:
	a	[0 => 2]
	b	[0 => 2]
	c	[0 => 2]


	Upvalues[0]:

}

