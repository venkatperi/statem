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
import Service from "./fixtures/Service";
import Deferred from "../src/util/Deferred";
import {expect} from 'chai'
import delay from "../src/util/delay";
import {State} from "../src/types";

class TestService extends Service {
    started = new Deferred()
    stopped = new Deferred()
    cancelled = new Deferred()
    timeout = 500

    async doStart() {
        await this.started
    }

    async doStop() {
        await this.stopped
    }

    async doCancel() {
        await this.cancelled
    }
}

let sm

async function throws(f) {
    let x = new Deferred()
    try {
        await f()
        x.reject('Should throw')
    } catch (e) {
        x.resolve()
    }
    await x
}

function stateIs(s: State) {
    it(`in state "${s}"`, async () =>
        expect(await sm.getState()).to.eq(s))
}

function startFails() {
    it("can't call start() now", async () => await throws(sm.start))
}

let failure = new Error("failure reason")

function hasFailureReason() {
    it("has failure reason", () => {
        expect(sm.errors.length).is.eq(1)
        expect(sm.errors[0].message).is.eq(failure.message)
    })
}

function hasTimeoutFailure() {
    it("has timeout reason", () => {
        expect(sm.errors.length).is.eq(1)
        expect(sm.errors[0].message.indexOf('Timeout') >= 0).to.be.true
    })
}

describe('service', () => {
    beforeEach(() => sm = new TestService())

    describe("start service", () => {
        beforeEach(async () => await sm.start())

        stateIs('starting')
        startFails()

        describe("failed start", () => {
            beforeEach(async () => {
                sm.started.reject(failure)
                await delay(10)
            })

            stateIs('failed')
            startFails()
            hasFailureReason()
        })

        describe("stop before fully started", () => {
            beforeEach(async () => {
                sm.stop()
                await delay(10)
            })

            stateIs('cancelling')
            startFails()

            describe("successful cancel", () => {
                beforeEach(async () => {
                    sm.cancelled.resolve()
                    await delay(10)
                })

                stateIs('terminated')
                startFails()
            })

            describe("failed cancel", () => {
                beforeEach(async () => {
                    sm.cancelled.reject(failure)
                    await delay(10)
                })

                stateIs('failed')
                startFails()
                hasFailureReason()
            })

            describe("timeout during cancel", () => {
                beforeEach(async () => await delay(600))
                stateIs('failed')
                startFails()
                hasTimeoutFailure()
            })
        })

        describe("timeout during starting", () => {
            beforeEach(async () => await delay(600))

            stateIs('failed')
            startFails()
            hasTimeoutFailure()
        })

        describe("successful start", () => {
            beforeEach(async () => {
                sm.started.resolve();
                await delay(10)
            })

            stateIs('running')
            startFails()

            describe("stop running service", () => {
                beforeEach(() => sm.stop())

                stateIs('stopping')
                startFails()

                describe("successful stop", () => {
                    beforeEach(async () => {
                        sm.stopped.resolve();
                        await delay(10)
                    })

                    stateIs('terminated')
                    startFails()
                })

                describe("failed stop", () => {
                    beforeEach(async () => {
                        sm.stopped.reject(failure);
                        await delay(10)
                    })

                    stateIs('failed')
                    startFails()
                    hasFailureReason()
                })

                describe("timeout during stopping", () => {
                    beforeEach(async () => await delay(600))

                    stateIs('failed')
                    startFails()
                    hasTimeoutFailure()
                })
            })
        })
    })

})


