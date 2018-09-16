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


import Action from './Action'
import Event from "../event/Event";
import {EventContext, From} from "../types";
import NextEvent from "./NextEvent";
import Reply from "./Reply";
import Postpone from "./Postpone";
import Hibernate from "./Hibernate";
import StateTimeout from "./StateTimeout";
import EventTimeout from "./EventTimeout";
import GenericTimeout from "./GenericTimeout";

export default Action

export type ActionList = Array<Action>

export namespace Actions {
    export function nextEvent(event: Event, context: EventContext) {
        return new NextEvent(event, context)
    }

    export function reply(from: From, reply: any): Reply {
        return new Reply(from, reply)
    }

    export function postpone(postpone: boolean): Postpone {
        return new Postpone(postpone)
    }

    export function hibernate(hibernate: boolean): Hibernate {
        return new Hibernate(hibernate)
    }

    export function stateTimeout(time: number): StateTimeout {
        return new StateTimeout(time)
    }

    export function eventTimeout(time: number): EventTimeout {
        return new EventTimeout(time)
    }

    export function genericTimeout(time: number): GenericTimeout {
        return new GenericTimeout(time)
    }
}
