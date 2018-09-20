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
import {ToggleButton, ToggleButtonWithCount} from "./fixtures/Buttons";
import {State} from "../index";
import {expect} from "chai";


let sm

function stateIs(s: State) {
    it(`in state "${s}"`, async () =>
        expect(await sm.getState()).to.eq(s))
}


function countIs(count: number) {
    it(`count is ${count}"`, async () =>
        expect(await sm.getData()).to.eql({count}))
}


describe('toggle button', () => {
    beforeEach(() => sm = new ToggleButton().startSM())

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
    beforeEach(() => sm = new ToggleButtonWithCount().startSM())

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


