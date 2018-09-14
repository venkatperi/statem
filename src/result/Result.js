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

import type {Actions} from 'src/action/Action';

import Logger from '../../Logger';
import {State} from '../State';
import StateMachine from '../StateMachine';
import type {Data} from '../types';

const log = Logger( 'Result' )

export class Result {
  type: string
  newData: ?Data
  actions: ?Actions

  constructor( newData: ?Data, actions: ?Actions ) {
    this.newData = newData
    this.actions = actions
  }

  process( sm: StateMachine ) {
    log.info( `process: %j`, this )
    if ( this.newData !== undefined )
      sm.data = this.newData

    sm.handleActions( this.actions )
  }
}

export class NextStateResult extends Result {
  type = 'nextState'
  nextState: State

  constructor( nextState: State, newData: ?Data, actions: ?Actions ) {
    super( newData, actions )
    this.nextState = nextState
  }

  process( sm: StateMachine ) {
    sm.state = this.nextState
    super.process( sm )
  }
}

export class KeepStateResult extends Result {
  type = 'keepState'

  constructor( newData: ?Data, actions: ?Actions ) {
    super( newData, actions )
  }
}


export class KeepStateAndDataResult extends Result {
  type = 'keepStateAndData'

  constructor( actions: ?Actions ) {
    super( null, actions )
  }
}


export class RepeatStateResult extends Result {
  type = 'repeatState'

  constructor( newData: ?Data, actions: ?Actions ) {
    super( newData, actions )
  }
}

export class RepeatStateAndDataResult extends Result {
  type = 'repeatStateAndData'

  constructor( actions: ?Actions ) {
    super( null, actions )
  }
}

export class StopResult extends NextStateResult {
  type = 'stop'

  constructor( nextState: State, newData: ?Data, actions: ?Actions ) {
    super( nextState, newData, actions )
  }
}

export function nextState( nextState: State, newData: ?Data, actions: ?Actions ) {
  return new NextStateResult( nextState, newData, actions )
}

export function repeatState( newData: ?Data, actions: ?Actions ) {
  return new RepeatStateResult( newData, actions )
}

export function repeatStateAndData( actions: ?Actions ) {
  return new RepeatStateAndDataResult( actions )
}

export function keepState( newData: ?Data, actions: ?Actions ) {
  return new KeepStateResult( newData, actions )
}

export function keepStateAndData( actions: ?Actions ) {
  return new KeepStateAndDataResult( actions )
}

export function stop( nextState: State, newData: ?Data, actions: ?Actions ) {
  return new StopResult( nextState, newData, actions )
}
