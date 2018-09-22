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
import { State } from "..";
import HotelSafe from "../examples/HotelSafe";
import { stateRoute } from "../src/State";
import delay from "../src/util/delay";

let safe
let code = [1, 2, 3, 4]
let badCode = [0, 2, 3, 4]


function stateIs(s: State) {
    it(`in state "${s}"`, async () =>
        expect(stateRoute(await safe.getState())).is.eq(s))
}

function sendCode(code: Array<number>) {
    for (let d of code) {
        safe.button(d)
    }
}

describe('hotel safe', () => {

    beforeEach(() => {
        safe = new HotelSafe(200).startSM()
    })

    it('initial code is empty', async () => {
        let data = await safe.getData()
        expect(data.code.length).to.eq(0)
    })

    it('initial state is OPEN', async () => {
        stateIs('open')
    })

    describe('locking the safe', () => {
        beforeEach(() => safe.reset())

        stateIs('locking')

        describe('times out on inactivity', () => {
            beforeEach(async () => {
                sendCode([1, 2])
                await delay(500)
            })
            stateIs('open')
        })

        describe('enter new code', () => {
            beforeEach(() => {
                sendCode(badCode)   // gets pushed out by next batch of digits
                sendCode(code)
            })

            it('stores new code', async () => {
                let data = await safe.getData()
                expect(data.code).to.eql(code)
            })

            describe('press LOCK', () => {
                beforeEach(() => safe.lock())
                stateIs('closed')
            })

            describe('locked safe', () => {
                beforeEach(async () => safe.lock())

                describe('enter correct code', () => {
                    beforeEach(() => sendCode(code))
                    stateIs('open')
                })

                describe('enter wrong code', () => {
                    beforeEach(() => sendCode(badCode))
                    describe('shows error', () => {
                        stateIs('closed/message')
                    })
                    describe('removes message after timeout', () => {
                        beforeEach(async () => await delay(500))
                        stateIs('closed')
                    })
                })
            })
        })
    })
})
