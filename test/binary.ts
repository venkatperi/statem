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
import StateMachine, {nextState, State} from "..";
import {keepState} from "../index";


/**
 * A simple SM that goes back and forth between two states on
 * event NEXT
 */
export default class BinaryStateMachine extends StateMachine {
    initialState = 'ONE'

    data = 0

    handlers = {
        // initialize data in initial state
        'enter#old/:old#ONE': () =>
            keepState().data(1),

        'cast#next#ONE': ({data}) =>
            nextState('TWO').data(data + 1),

        'cast#next#TWO': () =>
            nextState('ONE'),

        // Get the current state
        'call/:from#getState#:state': ({args, current}) =>
            keepState().reply(args.from, current),

        // Get the current data
        'call/:from#getData#:state': ({args, data}) =>
            keepState().reply(args.from, data),
    }

    next() {
        this.cast('next')
    }

    async getState(): Promise<State> {
        return await this.call('getState')
    }

    async getData() {
        return await this.call('getData')
    }
}


let sm

function next(max = 5, depth = 1) {
    describe(`raise NEXT ${depth * 2 - 1}`, () => {
        beforeEach(() => {
            sm.cast('next')
        })

        it('state is TWO', async () => {
            expect(await sm.getState()).to.eq('TWO')
        })

        it('data is 2', async () => {
            expect(await sm.getData()).to.eq(2)
        })

        describe(`raise NEXT ${depth * 2}`, () => {
            beforeEach(() => {
                sm.cast('next')
            })

            it('state is ONE', async () => {
                expect(await sm.getState()).to.eq('ONE')
            })

            it('data is 1', async () => {
                expect(await sm.getData()).to.eq(1)
            })

            if (depth < max) {
                next(max, depth + 1)
            }
        })
    })
}

describe('actions', () => {

    beforeEach(() => {
        sm = new BinaryStateMachine()
        sm.start()
    })

    it('initial state is ONE', async () => {
        expect(await sm.getState()).to.eq('ONE')
    })

    it('initial data is 1', async () => {
        expect(await sm.getData()).to.eq(1)
    })

    next(5)

})
