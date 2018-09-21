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


import StateMachine, {Handlers, nextState, Timeout} from "../index"

export class ToggleButton extends StateMachine {
    initialState = 'off'

    handlers: Handlers = [
        ['cast#flip#off', 'on'],
        ['cast#flip#on', 'off']
    ]

    flip() {
        this.cast('flip')
    }
}

export class ToggleButtonWithCount extends StateMachine {
    initialState = 'off'

    initialData = {
        count: 0
    }

    handlers: Handlers = [
        ['cast#flip#off', ({data}) => nextState('on').data({count: {$set: data.count + 1}})],
        ['cast#flip#on', 'off']
    ]

    flip() {
        this.cast('flip')
    }
}


export class PushButton extends StateMachine {
    initialState = 'off'

    handlers: Handlers = [
        ['cast#push#off', 'on'],
        ['cast#release#on', 'off']
    ]

    push() {
        this.cast('push')
    }

    release() {
        this.cast('release')
    }
}


export class PushButtonCountdownTimer extends StateMachine {
    initialState = 'off'

    handlers: Handlers = [
        ['cast#push#off', ({data}) => nextState('on').timeout(data.timeout)],
        ['genericTimeout#*_#on', 'off']
    ]

    constructor(timeout: Timeout) {
        super()
        this.initialData = {timeout}
    }

    push() {
        this.cast('push')
    }
}

