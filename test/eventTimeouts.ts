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
import { keepState, StateMachine } from "../index";
import delay from "../src/util/delay";

let sm
let promise

type SMData = {
    from: Array<string>
}

describe('event timeouts', () => {

    beforeEach(() => {
        sm = new StateMachine<SMData>({
            handlers: [
                ['call/:from#waitForTimeout#*_', ({args}) =>
                    keepState().data({from: {$push: [args.from]}})],

                /**
                 * (cast:st, ONE) --> (TWO, eventTimeout)
                 */
                ['cast#next#ONE', ['TWO', 200]],

                /**
                 * (cast:next, TWO) --> ONE
                 */
                ['cast#next#TWO', 'ONE'],

                /**
                 * (eventTimeout, TWO) --> THREE
                 */
                ['eventTimeout#*_#TWO', 'THREE'],
                ['enter#*_#THREE', ({data}) => {
                    let res = keepState()
                    for (const x of data.from) {
                        res = res.reply(x)
                    }
                    return res
                }],
            ],
            initialData: {from: []},
            initialState: "ONE",
        })
        sm.startSM()

        // register promise otherwise
        // we'll cancel the timeout
        promise = sm.call('waitForTimeout')
        sm.cast('next')
    })

    it("fires if no events received before timeout", async () => {
        await promise
        expect(await sm.getState()).to.eq('THREE')
    })

    it("cancels timer if an event is received",
        async () => {
            await delay(100)    // wait less than the timeout
            sm.cast('next')
            await delay(500)    // wait for a long time
            expect(sm.hasEventTimer).to.be.false
            expect(await sm.getState()).to.eq('ONE')
        })
})

