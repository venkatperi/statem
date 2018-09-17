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
import {expect} from 'chai'
import StateMachine, {keepState, State} from "..";
import Deferred from "../src/util/Deferred";


let sm
describe('init SM', () => {

    let enterInitial = new Deferred<State>()

    beforeEach(() => {
        sm = new StateMachine({
            initialState: "ONE",
            data: 123,
            handlers: {
                'enter#old/:old#ONE': ({args}) => {
                    enterInitial.resolve(args.old)
                    return keepState()
                }
            }
        }).start()
    })

    it("has initial state", async () =>
        expect(await sm.getData()).to.eq(123))

    it("has initial data", async () =>
        expect(await sm.getData()).to.eq(123))

    it("fires ENTER event for initial state", async () => {
        expect(await enterInitial.promise).to.eq("ONE")
    })
})

