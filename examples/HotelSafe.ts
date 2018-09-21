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


import StateMachine, {Handlers, keepState, nextState, Timeout} from "../index"
import pushFixed from "../src/util/pushFixed";
import {arrayEqual} from "../src/util/arrayEqual";

export default class HotelSafe extends StateMachine {
    initialState = 'open'

    initialData: {
        code: number[],
        input: number[],
        codeTimeout: Timeout,
        msgDisplay: Timeout,
        codeSize: number
    } = {
        code: [],
        input: [],
        codeTimeout: 200,
        msgDisplay: 200,
        codeSize: 4
    }

    handlers: Handlers = [

        // Clear data when safe enters OPEN
        ['enter#*_#open', () =>
            keepState().data({code: {$set: []}, input: {$set: []}})],

        // User pressed RESET -- go to LOCKING
        ['cast#reset#open', 'locking'],

        // Timeout from LOCKING if inactive
        ['enter#*_#locking', ({data}) =>
            keepState().eventTimeout(data.codeTimeout)],

        // Track the last {codeSize} digits.
        ['cast#button/:digit#locking', ({args, data}) => {
            let code = pushFixed(Number(args.digit), data.code, data.codeSize)
            return keepState()
                .data({code: {$set: code}})
                .eventTimeout(data.codeTimeout)
        }],

        // Back to OPEN if inactive timer fires
        ['eventTimeout#time/:time#locking', 'open'],

        // User pressed LOCK. CLose safe if code is long enough
        // else ignore
        ['cast#lock#locking', ({data}) =>
            data.code.length === data.codeSize ?
                nextState('closed') :
                keepState()],

        // User entered digit(s).
        // Keep state if code is not long enough
        // OPEN if input matches code
        // go to INCORRECT if code does not match and set a timeout
        ['cast#button/:digit#closed', ({args, data}) => {
            let digit = Number(args.digit)
            let input = data.input.concat(digit)
            return input.length < data.code.length ?
                keepState().data({input: {$push: [digit]}}) :
                arrayEqual(data.code, input) ?
                    nextState('open') :
                    nextState('incorrect').timeout(data.msgDisplay)
        }],

        // go back to CLOSED after showing message
        ['genericTimeout#time/:time#incorrect', 'closed'],
    ]

    constructor(timeout: Timeout) {
        super()
        this.initialData.codeTimeout = timeout
        this.initialData.msgDisplay = timeout
    }

    reset() {
        this.cast('reset')
    }

    lock() {
        this.cast('lock')
    }

    button(digit: number) {
        this.cast({button: digit})
    }
}
