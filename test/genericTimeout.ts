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

import { expect } from 'chai'
import 'mocha'
import StateMachine from "..";
import { nextState } from "../index";
import delay from "../src/util/delay";

let hodor = 'hodor'
let sm

describe('genericTimeout', () => {
    beforeEach(() => {

        sm = new StateMachine({
            "handlers": [
                /**
                 * (cast:next, ONE) --> (TWO, genericTimeout)
                 */
                ['cast#next#ONE', () => nextState('TWO').timeout(200, hodor)],

                /**
                 * (cast:next, TWO) --> ONE
                 */
                ['cast#next#TWO', () => nextState('ONE')],

                /**
                 * (genericTimeout, TWO) --> THREE
                 */
                ['genericTimeout#*_#TWO', () => nextState('THREE')],
            ],
            "initialState": "ONE",
        }).startSM()
        sm.cast('next')
    })

    it("has a timer", async () => {
        await delay(10) // wait for cast event to be processed
        expect(sm.hasTimer(hodor)).to.be.true
    })

    it("fires unless cancelled", async () => {
        await delay(400)  // otherwise returns 2. Domain issue?
        expect(await sm.getState()).to.eq('THREE')
    })

    it("doesn't fire if cancelled", async () => {
        await delay(100)    // ensure state transition within timeout
        sm.cancelTimer(hodor)
        await delay(500)    // wait for a long time
        expect(sm.hasTimer(hodor)).to.be.false
        expect(await sm.getState()).to.eq('TWO')
    })
})


