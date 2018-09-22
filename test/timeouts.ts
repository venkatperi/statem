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
import Deferred from "../src/util/Deferred";
import delay from "../src/util/delay";

describe('timeouts', () => {
    let sm
    let timeouts

    beforeEach(() => {
        timeouts = {
            "event": new Deferred(),
            "generic": new Deferred(),
            "state": new Deferred(),
        }

        sm = new StateMachine({
            "handlers": [
                /**
                 * (cast:st, ONE) --> (TWO, stateTimeout)
                 */
                ['cast#st#ONE', () => nextState('TWO').stateTimeout(200)],

                /**
                 * (cast:st, ONE) --> (THREE, eventTimeout)
                 */
                ['cast#et#ONE', () => nextState('THREE').eventTimeout(200)],

                /**
                 * (cast:next, TWO) --> ONE
                 */
                ['cast#next#TWO', () => nextState('ONE')],

                /**
                 * (cast:next, THREE) --> ONE
                 */
                ['cast#next#THREE', () => nextState('ONE')],

                /**
                 * (cast:nop, THREE) --> THREE
                 */
                ['cast#nop#THREE', () => nextState('THREE')],

                /**
                 * (stateTimeout, TWO) --> FOUR
                 */
                ['stateTimeout#*_#TWO', () => nextState('FOUR')],
                ['enter#*_#FOUR', () => timeouts.state.resolve()],

                /**
                 * (eventTimeout, THREE) --> FIVE
                 */
                ['eventTimeout#*_#THREE', () => nextState('FIVE')],
                ['enter#*_#FIVE', () => timeouts.event.resolve()],
            ],
            "initialState": "ONE",
        }).startSM()
    })

    describe('setting a state timeout', () => {
        // from ONE, fire 'st'. Goes to "TWO" and sets stateTimeout
        beforeEach(() => sm.cast('st'))

        it("fires if no state transition occurs", async () => {
            await timeouts.state
            expect(await sm.getState()).to.eq('FOUR')
        })

        it("cancels state timeout timer if state transition occurs before it fires",
            async () => {
                await delay(100)    // ensure state transition within timeout
                sm.cast('next')
                await delay(500)    // wait for a long time
                expect(timeouts.state.completed).to.be.false
                expect(sm.hasStateTimer).to.be.false
                expect(await sm.getState()).to.eq('ONE')
            })
    })

    describe('setting an event timeout', () => {
        // from ONE, fire 'et'. Goes to "THREE" and sets eventTimeout
        beforeEach(() => sm.cast('et'))

        it("fires if no new event is seen", async () => {
            expect(await sm.getState()).to.eq('THREE')
            expect(timeouts.event.completed).to.be.false
            await timeouts.event
            expect(await sm.getState()).to.eq('FIVE')
        })

        it("cancels timer if an event is received before it fires",
            async () => {
                await delay(100)    // ensure state transition within timeout
                sm.cast('nop')
                await delay(500)    // wait for a long time
                expect(timeouts.event.completed).to.be.false
                expect(sm.hasEventTimer).to.be.false
                expect(await sm.getState()).to.eq('THREE')
            })
    })

})

