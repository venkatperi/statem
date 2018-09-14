// @flow
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

import type {From} from '../types';

export type EventContext = ?any

export class Event {
  type: string
  context: EventContext

  constructor( context: EventContext ) {
    this.context = context
  }

  get contextRoute(): string {
    switch ( typeof this.context ) {
      case 'object' :
        return Object.entries( this.context ).map(
          ( [k, v] ) => `${k}/${v}` )

      case null:
      case undefined:
        return undefined

      default:
        return this.context
    }
  }

  get typeRoute(): string {
    return this.type
  }

  get route(): string {
    return `${this.typeRoute}#${this.contextRoute}`
  }
}

export class CallEvent extends Event {
  type = 'call'
  from: From

  constructor( from: From, context: EventContext ) {
    super()
    this.from = from
    this.context = context
  }

  get typeRoute(): string {
    return `${this.type}/${this.from}`
  }
}


export class CastEvent extends Event {
  type = 'cast'

  constructor( context: EventContext ) {
    super( context )
  }
}

export class InfoEvent extends Event {
  type = 'info'

  constructor( context: EventContext ) {
    super( context )
  }
}

export class InternalEvent extends Event {
  type = 'internal'

  constructor( context: EventContext ) {
    super( context )
  }
}

export class TimeoutEvent extends Event {
  time: number

  constructor( time: number, context: EventContext ) {
    super( context )
    this.time = time
  }
}

export class StateTimeoutEvent extends Event {
  type = 'stateTimeout'

  constructor( time: number, context: EventContext ) {
    super( time, context )
  }
}
