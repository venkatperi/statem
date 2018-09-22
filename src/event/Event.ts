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

import * as _ from "lodash"
import * as objectInspect from "object-inspect"
import { State, stateRoute } from "../State"
import { EventContext, EventExtra, EventType, Priority } from "../types";
import { dataToRoute, dataToString } from "../util/StringHelper";


export default class Event {
    /**
     * The event's type
     */
    readonly type: EventType

    /**
     * Event's priority when enqueued
     * @type {Priority}
     */
    priority: Priority = Priority.Normal

    /**
     * Constructor
     * @param context
     * @param extra
     */
    constructor(public context?: EventContext, public extra?: EventExtra) {
    }

    /**
     * Serialize this event to a route
     * @return {string}
     */
    get route(): string {
        return `${this.typeRoute}#${this.contextRoute}`
    }

    /**
     *  Serialize event context to a string
     *
     * @return {string}
     */
    get contextString(): string {
        return dataToString(this.context)
    }

    /**
     * Serialize context to route path
     * @return {string}
     */
    protected get contextRoute(): string {
        return dataToRoute(this.context)
    }

    /**
     * Serialize type to route path
     * @return {EventType}
     */
    protected get typeRoute(): string {
        return this.type
    }

    /**
     * Comparator based on priorities
     *
     * @return {number}
     * @param a
     * @param b
     */
    static comparator(a: Event, b: Event): number {
        return a.priority - b.priority
    }

    /**
     * Maps event to route for given state
     * @param state
     * @return {string}
     */
    toRoute(state: State): string {
        return `${this.route}#${stateRoute(state)}`
    }

    /**
     * Convert to displayable string
     *
     * @return {string}
     */
    toString(): string {
        // return `${_.upperFirst(
        //     this.type)}@${Priority[this.priority]} ${this.contextString}`
        return [`${_.upperFirst(this.type)}@${Priority[this.priority]}`,
            objectInspect({
                "context": this.context
            })].join(' ')
    }
}
