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

import type {Reply} from 'src/action/Reply';
import type {EventContext} from '../types';

export type EventTimeout = {
  type: 'eventTimeout',
  time: number,
  context: EventContext,
  options: Object
}

export type StateTimeout = {
  type: 'stateTimeout',
  time: number,
  context: EventContext,
  options: Object
}

export type Genericimeout = {
  type: 'genericTimeout',
  time: number,
  context: EventContext,
  options: Object
}
export type Timeout = StateTimeout | EventTimeout | Genericimeout

function makeTimeout( type: string, time: number, context: ?EventContext, options: ?Object ): Reply {
  return {
    type,
    time,
    context,
    options,
  }
}

export function stateTimeout( time: number, context: ?EventContext, options: ?Object ): Reply {
  return makeTimeout( 'stateTimeout', time, context, options )
}

export function eventTimeout( time: number, context: ?EventContext, options: ?Object ): Reply {
  return makeTimeout( 'eventTimeout', time, context, options )
}

export function genericTimeout( time: number, context: ?EventContext, options: ?Object ): Reply {
  return makeTimeout( 'genericTimeout', time, context, options )
}
