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
import StateMachine, {keepState} from "..";
import Deferred from "../src/util/Deferred";
import {nextState} from "../index";

describe('init SM', () => {
    let entered
    let events
    let sm
    let states = ['ONE', 'TWO']

    beforeEach(() => {
        entered = {}
        events = {}
        for (let s of states) {
            entered[s] = new Deferred()
            events[s] = new Deferred()
        }
        sm = new StateMachine({
            initialState: "ONE",
            data: 123,
            handlers: [
                ['enter#old/:old#:state', ({args}) => {
                    entered[args.state].resolve(args.old)
                    return keepState()
                }],

                ['cast#next#ONE', () => nextState('TWO')],

                ['cast#next#TWO', () => nextState('ONE')],

                // catch-all
                [':event#*context#:state', ({route, args}) => {
                    console.log(route, args)
                    return keepState()
                }]
            ]
        })
            .on('state', (cur, old) => events[cur].resolve(old))
            .start()
    })

    it("initial state is set", async () =>
        expect(await sm.getState()).to.eq('ONE'))

    it("has initial data", async () =>
        expect(await sm.getData()).to.eq(123))

    it("fires ENTER event & old state == initial", async () =>
        expect(await entered.ONE.promise).to.eq("ONE"))

    it("fires node event with state name", async () =>
        expect(await events.ONE.promise).to.eq("ONE"))

    describe('on NEXT', () => {
        beforeEach(() => {
            sm.cast('next')
        })
        it("fires ENTER event & old state is ONE", async () =>
            expect(await entered.TWO.promise).to.eq("ONE"))

        it("has new state", async () =>
            expect(await sm.getState()).to.eq('TWO'))
    })
})

