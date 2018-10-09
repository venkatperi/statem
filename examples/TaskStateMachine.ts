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

import {
    Handlers, keepState, nextState, StateMachine, Timeout
} from '../index';

type TaskSMData<R> = {
    errors?: [],
    timeout?: Timeout
    result?: R
}

export default class TaskStateMachine<R> extends StateMachine<TaskSMData<R>> {

    handlers: Handlers<TaskSMData<R>> = [
        ['enter#*_#idle', () =>
            keepState()
                .emit('init')
                .data({
                    errors: {$set: []},
                    result: {$set: null},
                })],

        ['cast#start#idle', 'running'],

        ['enter#*_#running', ({data}) => {
            const res = keepState().emit('run')
            return data.timeout ? res.stateTimeout(data.timeout) : res
        }],

        ['cast#done#running', ({event}) =>
            nextState('done/done')
                .data({result: {$set: event.extra}})],

        ['cast#reset#running', () =>
            nextState('done/cancel').postpone()],

        ['cast#cancel#*_', ({event}) =>
            nextState('done/cancel')
                .data({errors: {$push: [event.extra]}})],

        ['cast#error#*_', ({event}) =>
            nextState('done/error')
                .data({errors: {$push: [event.extra]}})],

        ['enter#*_#done/:status', ({args, data}) =>
            keepState().emit(args.status, data)],

        ['cast#reset#done/*_', 'idle'],

        ['stateTimeout#*_#*_', 'done/timeout']
    ]

    initialData: TaskSMData<R> = {}

    initialState = 'idle'

    constructor(timeout?: Timeout) {
        super()
        this.initialData.timeout = timeout
        this.startSM()
    }

    cancel(reason?: any) {
        this.cast('cancel', reason)
    }

    error(reason?: any) {
        this.cast('error', reason)
    }

    done(result?: R) {
        this.cast('done', result)
    }

    reset() {
        this.cast('reset')
    }

    start() {
        this.cast('start')
    }
}
