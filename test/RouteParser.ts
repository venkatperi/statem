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
import RouteParser from "../src/route/RouteParser";
import {assert, expect} from 'chai'

let parser

let simple = {
    route: 'event#context#state',
    test: 'event#context#state',
}

let splats = {
    route: '*#*#*',
    test: 'event#context#state',
}

describe('route parser', () => {

    describe('simple test', () => {
        beforeEach(() => {
            parser = new RouteParser(simple.route)
        })

        it('creates parsers', () => {
            assert.isNotNull(parser.parsers.event)
            assert.isNotNull(parser.parsers.context)
            assert.isNotNull(parser.parsers.state)
        })

        it('parses route', () => {
            let res = parser.parse(simple.test)
            assert(res.matches)
        })
    })

    describe('all splats', () => {
        beforeEach(() => {
            parser = new RouteParser(splats.route)
        })

        it('parses', () => {
            let res = parser.parse(splats.test)
            console.log(res)
            assert(res.matches)
        })
    })
})

