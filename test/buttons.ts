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

import { expect } from "chai";
import 'mocha'
import { State } from "..";
import { PushButton } from "../examples/buttons/PushButton"
import { PushButtonCountdownTimer } from "../examples/buttons/PushButtonCountdownTimer"
import { ToggleButton } from "../examples/buttons/ToggleButton";
import { ToggleButtonWithCount } from "../examples/buttons/ToggleButtonWithCount"
import delay from "../src/util/delay";


let sm

function stateIs(s: State) {
    it(`in state "${s}"`, async () =>
        expect(await sm.getState()).to.eq(s))
}


function countIs(count: number) {
    it(`count is ${count}"`, async () =>
        expect(await sm.getData()).to.eql({count}))
}


describe('buttons', () => {
    describe('simple toggle button', () => {
        beforeEach(() => {
            sm = new ToggleButton()
            sm.startSM()
        })

        stateIs('off')
        describe('flip the toggle', () => {
            beforeEach(() => sm.flip())
            stateIs('on')
            describe('flip the toggle', () => {
                beforeEach(() => sm.flip())
                stateIs('off')
            })
        })
    })


    describe('toggle button with count', () => {
        beforeEach(() => {
            sm = new ToggleButtonWithCount()
            sm.startSM()
        })

        stateIs('off')
        countIs(0)
        describe('flip the toggle', () => {
            beforeEach(() => sm.flip())
            stateIs('on')
            countIs(1)
            describe('flip the toggle', () => {
                beforeEach(() => sm.flip())
                stateIs('off')
                countIs(1)
                describe('flip the toggle', () => {
                    beforeEach(() => sm.flip())
                    stateIs('on')
                    countIs(2)
                })
            })
        })
    })


    describe('push button', () => {
        beforeEach(() => {
            sm = new PushButton()
            sm.startSM()
        })

        stateIs('off')
        let cycle = (max, count = 0) => {
            describe('push', () => {
                beforeEach(() => sm.push())
                stateIs('on')
                describe('send push again before release is NOP', () => {
                    beforeEach(() => sm.push())
                    stateIs('on')
                })
                describe('release', () => {
                    beforeEach(() => sm.release())
                    stateIs('off')
                    describe('send release again before push is NOP', () => {
                        beforeEach(() => sm.release())
                        stateIs('off')
                    })
                    if (count < max - 1) {
                        cycle(max, count + 1)
                    }
                })
            })
        }
        cycle(2)
    })


    describe('push button countdown timer', () => {
        beforeEach(() => {
            sm = new PushButtonCountdownTimer("200ms")
            sm.startSM()
        })

        stateIs('off')
        let cycle = (max, count = 0) => {
            describe('push', () => {
                beforeEach(() => sm.push())
                stateIs('on')
                describe('before timeout', () => {
                    beforeEach(async () => await delay(100))
                    stateIs('on')
                    describe('after timeout', () => {
                        beforeEach(async () => await delay(150))
                        stateIs('off')
                        if (count < max - 1) {
                            cycle(max, count + 1)
                        }
                    })
                })
            })
        }
        cycle(2)
    })
})




