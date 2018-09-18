// Generated automatically by nearley, version 2.15.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

const lexer = moo.compile({
  hash: '#',
  ws:     /[ \t]+/,
  number: /[0-9]+/,
  id: /[a-zA-Z][a-zA-Z0-9_]*/
});
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "ROUTE", "symbols": ["EVENT", (lexer.has("hash") ? {type: "hash"} : hash), "CONTEXT", (lexer.has("hash") ? {type: "hash"} : hash), "STATE"]},
    {"name": "EVENT", "symbols": [(lexer.has("id") ? {type: "id"} : id)]},
    {"name": "CONTEXT$ebnf$1", "symbols": []},
    {"name": "CONTEXT$ebnf$1", "symbols": ["CONTEXT$ebnf$1", /[^#]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "CONTEXT", "symbols": ["CONTEXT$ebnf$1"]},
    {"name": "STATE", "symbols": [(lexer.has("id") ? {type: "id"} : id)]}
]
  , ParserStart: "ROUTE"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
