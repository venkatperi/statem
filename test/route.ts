//  Copyright 2018, Venkat Peri.
//
//  Permission is hereby granted, free of charge, to any person obtaining a
//  copy of this software and associated documentation files (the
//  "Software"), to deal in the Software without restriction, including
//  without limitation the rights to use, copy, modify, merge, publish,
//  distribute, sublicense, and/or sell copies of the Software, and to permit
//  persons to whom the Software is furnished to do so, subject to the
//  following conditions:
//
//  The above copyright notice and this permission notice shall be included
//  in all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
//  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
//  NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
//  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
//  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
//  USE OR OTHER DEALINGS IN THE SOFTWARE.

import 'mocha'
import * as assert from 'assert';
// import Route = require("route-parser");
import Route from 'path-parser'

type Args = {
    [k in string]: string
}

describe('route', () => {
    // it('state as arg', () => {
    //     const route = new Route('cast#someArg#:state')
    //     const args = <Args> route.match('cast#someArg#test')
    //     assert.equal(args.state, 'test')
    // })
    //
    // it('event as arg', () => {
    //     const route = new Route(':event#someArg#:state')
    //     const args = <Args>route.match('cast#someArg#test')
    //     assert.equal(args.event, 'cast')
    //     assert.equal(args.state, 'test')
    // })
    //
    // it('event params', () => {
    //     const route = new Route('call/:from#someArg#state')
    //     const args = <Args>route.match('call/abc#someArg#state')
    //     assert.equal(args.from, 'abc')
    // })
    //

    it('a splat', () => {
        const route = new Route('*splat')
        const args = route.test('abc')
        console.log(args)
    })

    it('more splats', () => {
        const route = new Route('(*spla)/:id')
        const args = route.test('abc/xyz')
        console.log(args)
    })

})
