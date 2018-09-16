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


import {keep, next, StateMachine} from "../.."
import {State} from "../../src/types";

let clean = {code: [], input: []}

export default class HotelSafe extends StateMachine {
    initialState = 'open'

    data = {code: [], input: []}

    handlers = {
        'enter#old/:old#open': () =>
            keep().data(clean),

        'cast#reset#open': () =>
            next('locking'),

        'enter#old/:old#locking': () =>
            keep().eventTimeout(200),

        'eventTimeout#time/:time#locking': () =>
            next('open'),

        'cast#button/:digit#locking': ({args, data}) => {
            data.code.push(Number(args.digit))
            return keep().data(data)
        },

        'cast#lock#locking': () =>
            next('closed'),

        'cast#button/:digit#closed': ({args, data}) => {
            data.input.push(Number(args.digit))
            if (data.input.length === data.code.length) {
                let inp = data.input.join('')
                data.input = []
                return inp === data.code.join('') ?
                    next('open').data(data) :
                    next('incorrect').data(data);
            }
            return keep().data(data)
        },

        'enter#old/:old#incorrect': () =>
            keep().timeout(200),

        'genericTimeout#time/:time#incorrect': () =>
            next('closed'),

        'call/:from#getState#:state': ({args, current}) =>
            keep().reply(args.from, current),

        'call/:from#getData#:state': ({args, data}) =>
            keep().reply(args.from, data),
    }

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
