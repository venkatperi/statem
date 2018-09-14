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

import type {Timeout} from '/Timeout';
import type {EventContext} from 'src/event/Event';

export class Action {
  type: string
}

export class NextEventAction extends Action {
  type = 'reply'
  event: Event
  context: EventContext

  constructor( event: Event, context: EventContext ) {
    super()
    this.event = event
    this.context = context
  }
}


export class ReplyAction extends Action {
  type = 'reply'
  from: string
  reply: any

  constructor( from: string, reply: any ) {
    super()
    this.from = from
    this.reply = reply
  }
}

export class PostponeAction extends Action {
  type = 'postpone'
  postpone: boolean

  constructor( postpone: boolean ) {
    super()
    this.postpone = postpone
  }
}

export class HibernateAction extends Action {
  type = 'hibernate'
  hibernate: boolean

  constructor( hibernate: boolean ) {
    super()
    this.hibernate = hibernate
  }
}

class TimeoutAction extends Action {
  time: number

  constructor( time: number ) {
    super()
    this.time = time
  }
}


export class StateTimeoutAction extends TimeoutAction {
  type = 'stateTimeout'

  constructor( time: number ) {
    super( time )
  }
}

export class EventTimeoutAction extends TimeoutAction {
  type = 'eventTimeout'

  constructor( time: number ) {
    super( time )
  }
}


export class GenericTimeoutAction extends TimeoutAction {
  type = 'genericTimeout'

  constructor( time: number ) {
    super( time )
  }
}

export type Actions = Array<Action>


