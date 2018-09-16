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


import StateMachine from "../../src/StateMachine";
import {next, stay} from "../../src/result";
import {Actions} from "../../src/action";

export default class Button extends StateMachine {
    initialState = 'off'

    data = 0

    handlers = {
        'cast#flip#off': ({data}) =>
            next('on').data(data + 1),

        'cast#flip#on': () =>
            next('off'),

        'call/:from#getCount#:state': ({args, data}) =>
            stay().do(Actions.reply(args.from, data)),

        'call/:from#getState#:state': ({args, current}) =>
            stay().do(Actions.reply(args.from, current)),
    }

    flip() {
        this.cast('flip')
    }

    async getCount() {
        return await this.call('getCount')
    }

    async getState() {
        return await this.call('getState')
    }

}
