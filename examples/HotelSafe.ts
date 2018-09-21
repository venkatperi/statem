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


import StateMachine, {keepState, nextState, State} from "../index"
import arrayEqual from "../src/util/arrayEqual";
import pushFixed from "../src/util/pushFixed";
import {Handlers} from "../src/types";

function clear() {
    return Object.assign({}, {code: [], input: []})
}

export default class HotelSafe extends StateMachine {
    initialState = 'open'

    codeSize = 4

    codeTimeout = 5000

    msgDisplay = 5000

    handlers: Handlers = [

        // Clear data when safe enters OPEN
        ['enter#*_#open', () =>
            keepState().withData(clear())],

        // User pressed RESET -- go to LOCKING
        ['cast#reset#open', () =>
            nextState('locking')],

        // Timeout from LOCKING if inactive
        ['enter#*_#locking', () =>
            keepState().eventTimeout(this.codeTimeout)],

        // Track the last {codeSize} digits.
        ['cast#button/:digit#locking', ({args, data}) => {
            data.code = pushFixed(
                Number(args.digit),
                data.code, this.codeSize)
            return keepState().withData(data).eventTimeout(this.codeTimeout)
        }],

        // Back to OPEN if inactive timer fires
        ['eventTimeout#time/:time#locking', () =>
            nextState('open')],

        // User pressed LOCK. CLose safe if code is long enough
        // else ignore
        ['cast#lock#locking', ({data}) =>
            data.code.length === this.codeSize ?
                nextState('closed') :
                keepState()],

        // User entered digit(s).
        // Keep state if code is not long enough
        // OPEN if input matches code
        // go to INCORRECT if code does not match and set a timeout
        ['cast#button/:digit#closed', ({args, data}) => {
            data.input.push(Number(args.digit))

            return data.input.length < data.code.length ?
                keepState().withData(data) :
                arrayEqual(data.code, data.input) ?
                    nextState('open') :
                    nextState('incorrect').timeout(this.msgDisplay)
        }],

        // go back to CLOSED after showing message
        ['genericTimeout#time/:time#incorrect', () =>
            nextState('closed')],

        // Get the current state
        ['call/:from#getState#:state', ({args, current}) =>
            keepState().reply(args.from, current)],

        // Get the current data
        ['call/:from#getData#:state', ({args, data}) =>
            keepState().reply(args.from, data)],
    ]

    reset() {
        this.cast('reset')
    }

    lock() {
        this.cast('lock')
    }

    button(digit) {
        this.cast({button: digit})
    }

    async getState(): Promise<State> {
        return await this.call('getState')
    }

    async getData() {
        return await this.call('getData')
    }
}
