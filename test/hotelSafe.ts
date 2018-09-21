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
import delay from "../src/util/delay";
import HotelSafe from "../examples/HotelSafe";
import {State} from "../src/types";

let safe
let code = [1, 2, 3, 4]


export function stateIs(s: State) {
    it(`in state "${s}"`, async () =>
        expect(await safe.getState()).to.eq(s))
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

        describe('enter code', () => {
            beforeEach(() => {
                for (let digit of code)
                    safe.button(digit - 1) // these will get pushed out
                for (let digit of code)
                    safe.button(digit)
            })

            it('stores new code', async () => {
                let data = await safe.getData()
                expect(data.code).to.eql(code)
            })

            it('press LOCK to lock the safe', async () => {
                safe.lock()
                stateIs('closed')
            })

            describe('locked safe', () => {
                beforeEach(async () => {
                    safe.lock()
                    await delay(200)
                })

                it('correct code opens safe', async () => {
                    for (let digit of code)
                        safe.button(digit)
                    stateIs('open')
                })

                it('wrong code sends it to INCORRECT, then CLOSED', async () => {
                    for (let digit of code)
                        safe.button(digit + 1)
                    expect(await safe.getState()).to.eq('incorrect')
                    stateIs('incorrect')
                    await delay(500)
                    stateIs('closed')
                })
            })
        })

        it('times out on inactivity and goes back to OPEN', async () => {
            safe.button(1)
            safe.button(2)
            await delay(500)
            stateIs('open')
            let data = await safe.getData()
            expect(data.code.length).to.eq(0)
        })
    })


})
