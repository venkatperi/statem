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

import { Spec } from "immutability-helper"
import { State } from "../../State"
import { EventContext, EventExtra, EventType, Timeout } from "../../types"
import KeepStateBuilder from "./KeepStateBuilder"
import NextStateBuilder from "./NextStateBuilder"
import RepeatStateBuilder from "./RepeatStateBuilder"
import ResultBuilder from "./ResultBuilder"

export class Response {
    private _builder?: ResultBuilder

    get builder(): ResultBuilder {
        this._builder = this._builder || new KeepStateBuilder()
        return this._builder
    }

    set builder(value: ResultBuilder) {
        if (this._builder) {
            throw new Error("Response already had a builder")
        }
        this._builder = value
    }

    /**
     * Helper to only mutate data
     * @param spec
     * @return {this}
     */
    data<TData>(spec: Spec<TData>): Response {
        this.builder.data(spec)
        return this
    }

    /**
     * Helper function to set the event timeout timer
     * @param time
     * @return {ResultBuilder}
     */
    eventTimeout(time: Timeout): Response {
        this.builder.eventTimeout(time)
        return this
    }

    /**
     * Helper function to insert an 'internal' event
     * @param {EventContext} context
     * @param {EventExtra} extra
     * @return {KeepStateBuilder}
     */
    internalEvent(context?: EventContext,
        extra?: EventExtra): Response {
        this.builder.internalEvent(context, extra)
        return this
    }

    /**
     * @return {this}
     */
    keepState(): Response {
        return this
    }

    /**
     * Helper function to insert a new event
     * @param type
     * @param context
     * @param extra
     * @return {ResultBuilder}
     */
    nextEvent(type: EventType, context?: EventContext,
        extra?: EventExtra): Response {
        this.builder.internalEvent(context, extra)
        return this
    }

    /**
     * Returns a {@link NextStateBuilder}
     * @param state
     * @return {NextStateBuilder}
     */
    nextState(state: State): Response {
        this.builder = new NextStateBuilder(state)
        return this
    }

    /**
     * Returns a {@link RepeatStateBuilder}
     * @return {RepeatStateBuilder}
     */
    repeatState(): Response {
        this.builder = new RepeatStateBuilder()
        return this
    }

    /**
     * Helper function to return a reply
     * @param from
     * @param msg
     * @return {ResultBuilder}
     */
    reply(from: string, msg: any): Response {
        this.builder.reply(from, msg)
        return this
    }

    /**
     * Helper function to set a state timeout (keeps state and data)
     * @param time
     * @return {ResultBuilder}
     */
    stateTimeout(time: Timeout): Response {
        this.builder.stateTimeout(time)
        return this
    }

    /**
     * helper function to set a generic timer
     * @param time
     * @return {ResultBuilder}
     */
    timeout(time: Timeout): Response {
        this.builder.timeout(time)
        return this
    }
}

