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

import {EventContext, EventType, Priority} from "../types";
import * as _ from 'lodash'

export default class Event {
    /**
     * The event's type
     */
    readonly type: EventType

    /**
     * Event arg/context
     */
    context?: EventContext

    /**
     * Event's priority when enqueued
     * @type {Priority}
     */
    priority: Priority = Priority.Normal

    /**
     * Constructor
     * @param context
     */
    constructor(context?: EventContext) {
        this.context = context
    }

    protected get contextRoute(): string {
        if (typeof this.context === 'object')
            return Object.entries(this.context)
                .map(([k, v]) => `${k}/${v}`)
                .join('/')

        switch (this.context) {
            case undefined:
            case null:
                return ''

            default:
                return this.context
        }
    }

    protected get typeRoute(): string {
        return this.type
    }

    get route(): string {
        return `${this.typeRoute}#${this.contextRoute}`
    }

    get contextString(): string {
        if (typeof this.context === 'object')
            return JSON.stringify(this.context)

        switch (this.context) {
            case undefined:
            case null:
                return ''

            default:
                return String(this.context)
        }
    }


    toString(): string {
        return `${_.upperFirst(this.type)}/${this.priority} {${this.contextString}}`
    }
}
