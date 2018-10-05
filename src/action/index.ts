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


import Action from "./Action"
import EmitAction from "./EmitAction"
import EventTimeoutAction from "./EventTimeoutAction";
import GenericTimeoutAction from "./GenericTimeoutAction";
import NextEventAction from "./NextEventAction";
import PostponeAction from "./PostponeAction";
import ReplyAction from "./ReplyAction";
import StateTimeoutAction from "./StateTimeoutAction";
import TimeoutAction from "./TimeoutAction";


export default Action

/**
 * @hidden
 */
export type ActionList = Array<Action>

export {
    TimeoutAction,
    NextEventAction,
    ReplyAction,
    PostponeAction,
    StateTimeoutAction,
    EventTimeoutAction,
    GenericTimeoutAction,
    EmitAction,
}


/**
 * @hidden
 */
export function isGenericTimeoutAction(a: Action): a is GenericTimeoutAction {
    return a.type === 'genericTimeout'
}

/**
 * @hidden
 */
export function isEventTimeoutAction(a: Action): a is EventTimeoutAction {
    return a.type === 'eventTimeout'
}

/**
 * @hidden
 */
export function isStateTimeoutAction(a: Action): a is StateTimeoutAction {
    return a.type === 'stateTimeout'
}

/**
 * @hidden
 */
export function isReplyAction(a: Action): a is ReplyAction {
    return a.type === 'reply'
}

/**
 * @hidden
 */
export function isNextEventAction(a: Action): a is NextEventAction {
    return a.type === 'nextEvent'
}

/**
 * @hidden
 */
export function isPostponeAction(a: Action): a is PostponeAction {
    return a.type === 'postpone'
}

/**
 * @hidden
 * @param a
 * @return {boolean}
 */
export function isEmitAction(a: Action): a is EmitAction {
    return a.type === 'emit'
}
