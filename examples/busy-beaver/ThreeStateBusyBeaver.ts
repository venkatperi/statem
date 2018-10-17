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

import { Handlers, nextState, StateMachine, } from '../../dist';

type Data = {
    tape: Array<number>
    head: number
}

export type HeadDirection = 'L' | 'R'

function moveTape(data: Data, dir: HeadDirection) {
    if (dir === 'L') {
        return {
            head: {$set: data.head + 1},
            tape: {$push: [0]},
        }
    }
    return {
        head: {$set: data.head - 1},
        tape: {$unshift: [0]},
    }
}

export default class ThreeStateBusyBeaver<R> extends StateMachine<Data> {

    handlers: Handlers<Data> = [

        ['cast#0#a', ({data}) => {
            return nextState('b')
                .data(moveTape(data, ''))
        }],

    ]

    initialData: Data = {
        head: 0,
        tape: [0],
    }

    initialState = 'a'

    constructor() {
        super()
        this.startSM()
    }

    async read() {
        let data = await this.getData()
        this.cast(data.tape[data.head])
    }

}

let beaver = new ThreeStateBusyBeaver()
    .on('output', console.log)


beaver.cast(0)
