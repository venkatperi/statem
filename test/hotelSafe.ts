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
import HotelSafe from "./fixtures/HotelSafe";
import delay from "../src/util/delay";

let safe
let code = [1, 2, 3, 4]

describe('hotel safe', () => {

    beforeEach(() => {
        safe = new HotelSafe()
        safe.start()
    })

    it('initial code is empty', async () => {
        let data = await safe.getData()
        expect(data.code.length).to.eq(0)
    })

    it('initial state is OPEN', async () => {
        expect(await safe.getState()).to.eq('open')
    })

    describe('locking the safe', () => {
        beforeEach(() => {
            safe.reset()
        })

        it('press RESET to enter the new code', async () => {
            expect(await safe.getState()).to.eq('locking')
        })

        describe('enter code', () => {
            beforeEach(() => {
                for (let digit of code)
                    safe.button(digit)
            })

            it('stores new code', async () => {
                let data = await safe.getData()
                expect(data.code).to.eql(code)
            })

            it('press LOCK to lock the safe', async () => {
                safe.lock()
                expect(await safe.getState()).to.eq('closed')
            })

            describe('locked safe', () => {
                beforeEach(async () => {
                    safe.lock()
                    await delay(200)
                })

                it('correct code opens safe', async () => {
                    for (let digit of code)
                        safe.button(digit)
                    expect(await safe.getState()).to.eq('open')
                })

                it('wrong code sends it to INCORRECT, then CLOSED', async () => {
                    for (let digit of code)
                        safe.button(digit + 1)
                    expect(await safe.getState()).to.eq('incorrect')
                    await delay(500)
                    expect(await safe.getState()).to.eq('closed')
                })
            })
        })

        it('times out on inactivity and goes back to OPEN', async () => {
            safe.button(1)
            safe.button(2)
            await delay(500)
            expect(await safe.getState()).to.eq('open')
            let data = await safe.getData()
            expect(data.code.length).to.eq(0)
        })
    })


})
