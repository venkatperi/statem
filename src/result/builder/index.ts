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
import { State } from "../../State";
import { EventContext, EventExtra, EventType, Timeout } from "../../types";
import KeepStateBuilder from "./KeepStateBuilder"
import NextStateBuilder from "./NextStateBuilder";
import RepeatStateBuilder from "./RepeatStateBuilder"
import ResultBuilder from "./ResultBuilder"


export default ResultBuilder
export { KeepStateBuilder, NextStateBuilder }

/**
 * Returns a {@link NextStateBuilder}
 * @param state
 * @return {NextStateBuilder}
 */
export function nextState(state: State): NextStateBuilder {
    return new NextStateBuilder(state)
}

/**
 * Returns a {@link KeepStateBuilder}
 * @return {KeepStateBuilder}
 */
export function keepState(): KeepStateBuilder {
    return new KeepStateBuilder()
}

/**
 * Returns a {@link RepeatStateBuilder}
 * @return {RepeatStateBuilder}
 */
export function repeatState(): RepeatStateBuilder {
    return new RepeatStateBuilder()
}

/**
 * Helper function to return a reply
 * @param from
 * @param msg
 * @return {ResultBuilder}
 */
export function reply(from: string, msg: any): KeepStateBuilder {
    return new KeepStateBuilder().reply(from, msg)
}

/**
 * Helper function to insert a new event
 * @param type
 * @param context
 * @param extra
 * @return {ResultBuilder}
 */
export function nextEvent(type: EventType, context?: EventContext,
    extra?: EventExtra): KeepStateBuilder {
    return new KeepStateBuilder().internalEvent(context, extra)
}

/**
 * Helper function to insert an 'internal' event
 * @param {EventContext} context
 * @param {EventExtra} extra
 * @return {KeepStateBuilder}
 */
export function internalEvent(context?: EventContext,
    extra?: EventExtra): KeepStateBuilder {
    return new KeepStateBuilder().internalEvent(context, extra)
}

/**
 * Helper function to set a state timeout (keeps state and data)
 * @param time
 * @return {ResultBuilder}
 */
export function stateTimeout(time: Timeout): KeepStateBuilder {
    return new KeepStateBuilder().stateTimeout(time)
}

/**
 * Helper function to set the event timeout timer
 * @param time
 * @return {ResultBuilder}
 */
export function eventTimeout(time: Timeout): KeepStateBuilder {
    return new KeepStateBuilder().eventTimeout(time)
}

/**
 * helper function to set a generic timer
 * @param time
 * @return {ResultBuilder}
 */
export function timeout(time: Timeout): KeepStateBuilder {
    return new KeepStateBuilder().timeout(time)
}

/**
 * Helper to only mutate data
 * @param spec
 * @return {ResultBuilder}
 */
export function data<TData>(spec: Spec<TData>): ResultBuilder {
    return new KeepStateBuilder().data(spec)
}
