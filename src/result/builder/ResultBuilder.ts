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

import Result from "../Result";
import {ActionList, EventTimeoutAction, GenericTimeoutAction, ReplyAction, StateTimeoutAction} from "../../action";
import {Data, EventContext, EventExtra, EventType, From, Timeout} from "../../types";
import PostponeAction from "../../action/PostponeAction";
import NextEventAction from "../../action/NextEventAction";
import update, {CustomCommands, Spec} from 'immutability-helper';


/**
 * Fluent builder for {Result}s
 */
export default abstract class ResultBuilder {
    _hasNewData = false
    _data?: Data
    _actions: ActionList = []
    _updates = []

    /**
     * Builds the result
     * @param data
     */
    abstract getResult(data?: Data): Result

    /**
     * Use the given data for the result
     * @return {this} for chaining
     * @param data
     */
    // withData(data: Data): ResultBuilder {
    //     this._hasNewData = true
    //     this._data = data
    //     return this
    // }

    /**
     * Adds the given actions to the result
     *
     * @param actions {ActionList} the actions
     * @return {this} for chaining
     */
    action(...actions: ActionList): ResultBuilder {
        this._actions.push(...actions)
        return this
    }

    /**
     *
     * @param time
     * @return {ResultBuilder}
     */
    stateTimeout(time: Timeout): ResultBuilder {
        return this.action(new StateTimeoutAction(time))
    }

    /**
     *
     * @param time
     * @return {ResultBuilder}
     */
    eventTimeout(time: number): ResultBuilder {
        return this.action(new EventTimeoutAction(time))
    }

    /**
     * Adds a {GenericTimeout} action with the given timeout
     * and optional name
     * @param time - the timeout in ms
     * @param name - optional name
     * @return {ResultBuilder} this
     */
    timeout(time: number, name?: string): ResultBuilder {
        return this.action(new GenericTimeoutAction(time, name))
    }

    /**
     * Adds a {Reply} action
     *
     * @param from - sends the reply here
     * @param msg - the message to send
     * @return {ResultBuilder}
     */
    reply(from: From, msg: any): ResultBuilder {
        return this.action(new ReplyAction(from, msg))
    }

    /**
     * Adds a postpone action
     *
     * @return {ResultBuilder}
     */
    postpone(): ResultBuilder {
        return this.action(new PostponeAction())
    }

    /**
     * Adds a next-event action
     *
     * @param type the next event's type
     * @param context optional event context
     * @return {ResultBuilder}
     * @param extra
     */
    nextEvent(type: EventType, context?: EventContext, extra?: EventExtra): ResultBuilder {
        return this.action(new NextEventAction(type, context, extra))
    }

    /**
     *
     * @param context
     * @return {ResultBuilder}
     */
    internalEvent(context?: EventContext): ResultBuilder {
        return this.action(new NextEventAction('internal', context))
    }

    /**
     * Set data mutation specs
     * @param spec
     * @return {this}
     */
    data<T, C extends CustomCommands<object> = never>(spec: Spec<T, C>,): ResultBuilder {
        this._updates.push(spec)
        return this
    }

    /**
     * Apply updates to the given data
     * @param data
     * @return {Data}
     */
    protected applyUpdates(data: Data) {
        for (let u of this._updates) {
            data = update(data, u)
        }
        return data
    }

}

