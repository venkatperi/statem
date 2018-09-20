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
import StateTimeoutEvent from "./StateTimeoutEvent";
import EventTimeoutEvent from "./EventTimeoutEvent";
import GenericTimeoutEvent from "./GenericTimeoutEvent";
import CallEvent from './CallEvent';
import CastEvent from './CastEvent';
import InternalEvent from './InternalEvent';
import EnterEvent from './EnterEvent';
import NextEventAction from "../action/NextEventAction";

export default Event

export {
    CallEvent,
    CastEvent,
    InternalEvent,
    EnterEvent,
    StateTimeoutEvent,
    EventTimeoutEvent,
    GenericTimeoutEvent,
}

export function makeNextEvent(action: NextEventAction) {
    switch (action.eventType) {
        case 'internal':
            return new InternalEvent(action.context)
        case 'cast':
            return new CastEvent(action.context, action.extra)
    }
}
