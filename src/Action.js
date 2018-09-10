//@flow
// Copyright 2017, Venkat Peri.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

import type {Event} from './Event';
import type {EventContext} from './types';

export type Postpone = { type: 'postpone', postpone: boolean }
export type Hibernate = { type: 'hibernate', hibernate: boolean }
export type NextEvent = { type: 'nextEvent', event: Event, context: EventContext }
export type Timeout = { type: 'timeout', time: number }
export type Reply = { type: 'reply', from: string, reply: Object }


export function reply( from, reply ): Reply {
  return {
    type: 'reply',
    from,
    reply,
  }
}

export type Action =
  Postpone
  | Hibernate
  | NextEvent
  | Timeout
  | Reply

export type ActionList = Array<Action>
