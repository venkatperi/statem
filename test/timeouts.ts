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
import StateMachine from "..";
import Deferred from "../src/util/Deferred";
import {nextState} from "../index";
import delay from "../src/util/delay";

describe('timeouts', () => {
    let sm
    let timeouts

    beforeEach(() => {
        timeouts = {
            state: new Deferred(),
            event: new Deferred(),
            generic: new Deferred(),
        }

        sm = new StateMachine({
            initialState: "ONE",
            handlers: [
                /**
                 * (state: ONE, event: (cast, next)) --> (state: TWO)
                 * Starts a stateTimeout
                 */
                ['cast#next#ONE', () => nextState('TWO').stateTimeout(200)],

                /**
                 * traps stateTimeout event in state TWO.
                 */
                ['stateTimeout#*_#TWO', () => {
                    timeouts.state.resolve();
                    // return nextState('TWO_STATE_TIMEOUT')
                }],

                /**
                 * (state: TWO, event: (cast, next)) --> (state: ONE)
                 */
                ['cast#next#TWO', () => nextState('ONE')],

            ]
        }).start()
    })

    describe('setting a state timeout', () => {

        // from ONE, fire 'next'. Goes to "TWO" and sets stateTimeout
        beforeEach(() => sm.cast('next'))

        it("fires if no state transition occurs", async () => {
            await timeouts.state
            expect(await sm.getState()).to.eq('TWO')
        })

        it("cancels state timeout timer if state transition occurs before it fires", async () => {
            await delay(100)    //ensure state transition within timeout
            sm.cast('next')
            await delay(500)    //wait for a long time
            expect(timeouts.state.completed).to.be.false
            expect(sm.hasStateTimer).to.be.false
            expect(await sm.getState()).to.eq('ONE')
        })

    })
})

