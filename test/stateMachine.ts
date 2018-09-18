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
import StateMachine, {internalEvent, stateTimeout} from "..";
import Deferred from "../src/util/Deferred";
import {nextState} from "../index";

describe('State Machine', () => {
    let entered
    let events
    let sm
    let states = ['ONE', 'TWO']
    let catchAll
    let internal
    let stateDefer

    beforeEach(() => {
        entered = {}
        events = {}
        catchAll = new Deferred()
        internal = new Deferred()
        stateDefer = new Deferred()

        for (let s of states) {
            entered[s] = new Deferred()
            events[s] = new Deferred()
        }

        sm = new StateMachine({
            initialState: "ONE",
            data: 123,
            handlers: [
                /**
                 * Trap all state enter events
                 */
                ['enter#old/:old#:state', ({args}) =>
                    entered[args.state].resolve(args.old)],

                /**
                 * (state: ONE, event: (cast, next)) --> (state: TWO)
                 */
                ['cast#next#ONE', () => nextState('TWO')],

                /**
                 * (state: TWO, event: (cast, next)) --> (state: ONE)
                 */
                ['cast#next#TWO', () => nextState('ONE')],

                /**
                 * (state: any, event: (cast, sendInternal)) --> adds internal event
                 */
                ['cast#sendInternal#:state', () => internalEvent('INTERNAL-EVENT')],

                /**
                 * Trap internal event
                 */
                ['internal#*context#:state', ({args}) => internal.resolve(args.context)],

                /**
                 * (state: any, event: (cast, {stateTimeout: time})) --> starts state timeout
                 */
                ['cast#stateTimeout/:time#:state', ({args}) => stateTimeout(args.time)],

                /**
                 * Trap state timeout event
                 */
                ["stateTimeout#*context#:state", ({args}) => stateDefer.resolve(args.context)],

                /**
                 * Catch-all route
                 */
                [':event#*context#:state', ({args}) => catchAll.resolve(args)]
            ]
        }).on('state', (cur, old) => events[cur].resolve(old))
            .start()
    })

    it("initial state is set", async () =>
        expect(await sm.getState()).to.eq('ONE'))

    it("has initial data", async () =>
        expect(await sm.getData()).to.eq(123))

    it("fires ENTER event & old state == initial", async () =>
        expect(await entered.ONE).to.eq("ONE"))

    it("fires node event with state name", async () =>
        expect(await events.ONE).to.eq("ONE"))

    it("catch-all rule traps unhandled routes", async () => {
        sm.cast('CATCH-ALL')
    })

    it("internal event", async () => {
        sm.cast('sendInternal')
        let args = await internal
        expect(args).to.eq('INTERNAL-EVENT')
    })

    it("state timeout", async () => {
        sm.cast({stateTimeout: 100})
        await stateDefer
    })

    describe('on NEXT', () => {
        beforeEach(() => {
            sm.cast('next')
        })
        it("fires ENTER event & old state is ONE", async () =>
            expect(await entered.TWO).to.eq("ONE"))

        it("has new state", async () =>
            expect(await sm.getState()).to.eq('TWO'))
    })
})

