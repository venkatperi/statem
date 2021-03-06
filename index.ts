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

import Action from './src/action'
import Event from './src/event'
import Result from './src/result'
import {
    data, eventTimeout, internalEvent, keepState, nextEvent, nextState,
    repeatState, reply, stateTimeout
} from './src/result/builder';
import { State } from './src/State';
import { StateMachine } from './src/StateMachine'
import { Handlers, Timeout } from './src/types';


export {
    StateMachine,
    Event, Result, Action, State, keepState,
    nextState, internalEvent, stateTimeout,
    repeatState, reply, nextEvent, eventTimeout, data,
    Handlers, Timeout
}

// @ts-ignore
if (typeof(window) !== "undefined") {

}
