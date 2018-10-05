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

import update, { Spec } from "immutability-helper"
import {
    ActionList, EventTimeoutAction, GenericTimeoutAction, NextEventAction,
    PostponeAction, ReplyAction, StateTimeoutAction
} from "../../action";
import EmitAction from "../../action/EmitAction"
import {
    EventContext, EventExtra, EventType, From, Timeout
} from "../../types";
import Result from "../Result"
import ResultWithData from "../ResultWithData"


/**
 * Fluent builder for {Result}s
 */
export default abstract class ResultBuilder {
    /**
     * @hidden
     *
     * @type {any[]}
     * @private
     */
    _actions: ActionList = []


    /**
     * @hidden
     * @type {any[]}
     * @private
     */
    _updates: Array<Spec<any>> = []

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
     * Cancel an existing event timeout timer
     * @return {ResultBuilder}
     */
    cancelEventTimeout(): ResultBuilder {
        return this.action(new EventTimeoutAction(-1))
    }

    /**
     * Cancel an existing state timeout timer
     * @return {ResultBuilder}
     */
    cancelStateTimeout(): ResultBuilder {
        return this.action(new StateTimeoutAction(-1))
    }

    /**
     * Cancel the named generic timer, if active
     * @param name
     * @return {ResultBuilder}
     */
    cancelTimeout(name?: string): ResultBuilder {
        return this.action(new GenericTimeoutAction(-1, name))
    }

    /**
     * Set data mutation specs
     * @param spec
     * @return {this<TData>}
     */
    data<TData>(spec: object): ResultBuilder {
        this._updates.push(spec)
        return this
    }

    /**
     * Tells the state machine to emit the given event with arguments
     * @param name
     * @param args
     * @return {ResultBuilder}
     */
    emit(name: string, ...args: Array<any>) {
        return this.action(new EmitAction(name, ...args))
    }

    /**
     *
     * @param time
     * @return {ResultBuilder}
     */
    eventTimeout(time: Timeout): ResultBuilder {
        return this.action(new EventTimeoutAction(time))
    }

    /**
     * @hidden
     * Builds the result
     */
    abstract getResult<TData>(data?: TData): Result | ResultWithData<TData>

    /**
     * Adds an event of type 'internal'
     * @param context
     * @return {ResultBuilder}
     * @param extra
     */
    internalEvent(context?: EventContext, extra?: EventExtra): ResultBuilder {
        return this.action(new NextEventAction("internal", context, extra))
    }

    /**
     * Adds a next-event action
     *
     * @param type the next event's type
     * @param context optional event context
     * @return {ResultBuilder}
     * @param extra
     */
    nextEvent(type: EventType, context?: EventContext,
        extra?: EventExtra): ResultBuilder {
        return this.action(new NextEventAction(type, context, extra))
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
     * Adds a {Reply} action
     *
     * @param from - sends the reply here
     * @param msg - the message to send
     * @return {ResultBuilder}
     */
    reply(from: From, msg?: any): ResultBuilder {
        return this.action(new ReplyAction(from, msg))
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
     * Adds a {GenericTimeout} action with the given timeout
     * and optional name
     * @param time - the timeout in ms
     * @param name - optional name
     * @return {ResultBuilder} this
     */
    timeout(time: Timeout, name?: string): ResultBuilder {
        return this.action(new GenericTimeoutAction(time, name))
    }

    /**
     * @hidden
     * Apply updates to the given data
     * @param data
     * @return {TData}
     */
    protected applyUpdates<TData>(data: TData): TData {
        for (let u of this._updates) {
            data = update(data, u)
        }
        return data
    }
}

