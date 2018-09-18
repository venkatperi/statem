const nearley = require( 'nearley' );
const grammar = require( './route.js' );

// Create a Parser object from our grammar.
const parser = new nearley.Parser( nearley.Grammar.fromCompiled( grammar ) );

// Parse something!
parser.feed( 'cast#context#state' );

console.log( JSON.stringify( parser.results ) );
