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

import Event from './Event'
import {EventContext, From} from "../types";
import Call from "./Call";
import Cast from "./Cast";
import Internal from "./Internal";
import Info from "./Info";
import StateTimeoutEvent from "./StateTimeoutEvent";
import EventTimeoutEvent from "./EventTimeoutEvent";
import GenericTimeoutEvent from "./GenericTimeoutEvent";
import Enter from "./Enter";

export default Event

export type EventList = Array<Event>

export namespace Events {
    export function call(from: From, context?: EventContext): Call {
        return new Call(from, context)
    }

    export function cast(context?: EventContext): Cast {
        return new Cast(context)
    }

    export function internal(context?: EventContext): Internal {
        return new Internal(context)
    }

    export function info(context?: EventContext): Info {
        return new Info(context)
    }

    export function enter(context?: EventContext): Enter {
        return new Enter(context)
    }

    export function stateTimeout(time, context?: EventContext): StateTimeoutEvent {
        return new StateTimeoutEvent(time, context)
    }

    export function eventTimeout(time, context?: EventContext): EventTimeoutEvent {
        return new EventTimeoutEvent(time, context)
    }

    export function genericTimeout(time, context?: EventContext): GenericTimeoutEvent {
        return new GenericTimeoutEvent(time, context)
    }
}
