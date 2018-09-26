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
import StateMachine, { internalEvent, stateTimeout } from "..";
import Deferred from "../src/util/Deferred";

let states = ['ONE', 'TWO']

type SMData = {
    value: number,
    internal: Deferred<string>,
    entered: {
        [k in 'ONE' | 'TWO']: Deferred<void>
    }
}

let initial: SMData = {
    entered: {
        ONE: new Deferred<void>(),
        TWO: new Deferred<void>(),
    },
    internal: new Deferred(),
    value: 123,
}

describe('State Machine', () => {
    let events
    let sm
    // let catchAll
    let stateDefer

    beforeEach(() => {
        events = {}
        // catchAll = new Deferred()
        stateDefer = new Deferred()

        for (let s of states) {
            events[s] = new Deferred()
        }

        sm = new StateMachine<SMData>({
            handlers: [
                /**
                 * Trap all state enter events
                 */
                ['enter#old/:old#:state', ({data, args}) =>
                    data.entered[args.state].resolve(args.old)],

                /**
                 * (state: ONE, event: (cast, next)) --> (state: TWO)
                 */
                ['cast#next#ONE', 'TWO'],

                /**
                 * (state: TWO, event: (cast, next)) --> (state: ONE)
                 */
                ['cast#next#TWO', 'ONE'],

                /**
                 * (state: any, event: (cast, sendInternal)) --> adds internal
                 * event
                 */
                ['cast#sendInternal#:state',
                    () => internalEvent('INTERNAL-EVENT')],

                /**
                 * Trap internal event
                 */
                ['internal#*context#:state',
                    ({data, args}) => data.internal.resolve(args.context)],

                /**
                 * (state: any, event: (cast, {stateTimeout: time})) --> starts
                 * state timeout
                 */
                ['cast#stateTimeout/:time#:state',
                    ({args}) => stateTimeout(args.time)],

                /**
                 * Trap state timeout event
                 */
                ["stateTimeout#*context#:state",
                    ({args}) => stateDefer.resolve(args.context)],

                /**
                 * Catch-all route
                 */
                // [':event#*context#:state', ({args}) =>
                // catchAll.resolve(args)]
            ],
            initialData: () => initial,
            initialState: "ONE",
        }).on('state', (cur, old) => events[cur].resolve(old))
          .startSM()
    })

    it("initial state is set", async () =>
        expect(await sm.getState()).to.eq('ONE'))

    it("has initial data", async () => {
        let data = await sm.getData()
        expect(data.value).to.eq(123)
    })

    it("fires ENTER event & old state == initial", async () => {
        let data = await sm.getData()
        // console.log(data)
        return expect(await data.entered.ONE).to.eq("ONE")
    })

    it("fires node event with state name", async () =>
        expect(await events.ONE).to.eq("ONE"))

    it("catch-all rule traps unhandled routes", async () => {
        sm.cast('CATCH-ALL')
    })

    it("internal event", async () => {
        sm.cast('sendInternal')
        let data = await sm.getData()
        let args = await data.internal
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
        it("fires ENTER event & old state is ONE", async () => {
            let data = await sm.getData()
            return expect(await data.entered.TWO).to.eq("ONE")
        })

        it("has new state", async () =>
            expect(await sm.getState()).to.eq('TWO'))
    })
})

