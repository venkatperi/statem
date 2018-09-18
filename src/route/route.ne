@{%
const moo = require("moo");

const lexer = moo.compile({
  hash: '#',
  ws:     /[ \t]+/,
  number: /[0-9]+/,
  id: /[a-zA-Z][a-zA-Z0-9_]*/
});
%}

@lexer lexer

ROUTE -> EVENT %hash CONTEXT %hash STATE
EVENT -> %id
CONTEXT -> [^#]:*
STATE -> %id

