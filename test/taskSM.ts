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

import { assert, expect } from 'chai'
import 'mocha'
import TaskStateMachine from "../examples/TaskStateMachine"
import { State, stateRoute } from "../src/State"
import delay from "../src/util/delay"

let sm
let events


function stateIs(s: State) {
    it(`in state "${s}"`, async () =>
        expect(stateRoute(await sm.getState())).to.eq(s))
}

function eventFired(name: string, time: number = 10) {
    it(`event fired: "${name}"`, async () => {
        await delay(time)
        assert(events[name], `${name} didn't fire`)
    })
}

function eventDidNotFire(name: string, time: number = 10) {
    it(`event didn't fire: "${name}"`, async () => {
        await delay(time)
        assert(!events[name], `${name} fired`)
    })
}

describe('task state machine', () => {
    beforeEach(() => {
        events = {}
        sm = new TaskStateMachine(200)
        for (let e of ['init', 'run', 'done', 'cancel', 'error', 'timeout']) {
            sm.on(e, () => events[e] = true)
        }
    })

    describe("init", () => {
        eventFired('init')
        eventDidNotFire('run')
        eventDidNotFire('cancel')
        eventDidNotFire('done')
        eventDidNotFire('error')
        eventDidNotFire('timeout')

        describe("start task", () => {
            beforeEach(() => sm.start())
            stateIs('running')
            eventFired('run')
            eventDidNotFire('cancel')
            eventDidNotFire('done')
            eventDidNotFire('error')
            eventDidNotFire('timeout')

            describe("task completes successfully", () => {
                beforeEach(async () => {
                    await delay(100)  // less than the timeout
                    sm.done({a: 1})
                })
                stateIs('done/done')
                eventFired('done')
                eventDidNotFire('cancel')
                eventDidNotFire('error')
                eventDidNotFire('timeout')

                describe("reset completed task", () => {
                    beforeEach(() => {
                        sm.reset()
                        events.init = false
                    })
                    stateIs('idle')
                    eventFired('init')
                })
            })

            describe("task fails", () => {
                beforeEach(() => sm.error('error reason'))
                stateIs('done/error')
                eventFired('error')
                eventDidNotFire('cancel')
                eventDidNotFire('done')
                eventDidNotFire('timeout')

                describe("reset errored task", () => {
                    beforeEach(() => {
                        sm.reset()
                        events.init = false
                    })
                    stateIs('idle')
                    eventFired('init')
                })
            })

            describe("task timeout", () => {
                beforeEach(async () => await delay(400))
                stateIs('done/timeout')
                eventFired('timeout')
                eventDidNotFire('cancel')
                eventDidNotFire('done')
                eventDidNotFire('error')

                describe("reset task", () => {
                    beforeEach(() => {
                        sm.reset()
                        events.init = false
                    })
                    stateIs('idle')
                    eventFired('init')
                })
            })

            describe("cancel running task", () => {
                beforeEach(() => sm.cancel('cancel reason'))
                stateIs('done/cancel')
                eventFired('cancel')
                eventDidNotFire('timeout')
                eventDidNotFire('done')
                eventDidNotFire('error')

                describe("reset cancelled task", () => {
                    beforeEach(() => {
                        sm.reset()
                        events.init = false
                    })
                    stateIs('idle')
                    eventFired('init')
                })
            })

            describe("reset running task", () => {
                beforeEach(() => sm.reset())
                stateIs('idle')
                eventFired('cancel')
                eventFired('init')
                eventDidNotFire('timeout')
                eventDidNotFire('done')
                eventDidNotFire('error')
            })
        })
    })
})


