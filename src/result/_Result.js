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
import type {Data} from '../types';

const log = Logger( 'Result' )

export type EventHandlerResult = {
  type: 'eventHandler',
  newData: ?Data,
  actions: ?Actions
}

export type NextStateResult = {
  type: 'nextState',
  nextState: State,
  newData: ?Data,
  actions: ?Actions
}

export type KeepStateResult = {
  type: 'keepState',
  newData: ?Data,
  actions: ?Actions
}


export type RepeatStateResult = {
  type: 'repeatState',
  newData: ?Data,
  actions: ?Actions
}

export type StopResult = {
  type: 'stop',
  newData: ?Data,
  actions: ?Actions,
  reason: string
}

export type Result =
  EventHandlerResult
  | NextStateResult
  | KeepStateResult
  | RepeatStateResult
  | StopResult


export function nextState( nextState, newData, actions ) {
  const res = {
    type: 'nextState',
    nextState,
    newData,
    actions,
  }
  log.info( res )
  return res
}

export function repeatState( newData, ...actions ) {
  const res = {
    type: 'repeatState',
    newData,
    actions,
  }
  log.info( 'repeatState: %j', res )
  return res
}

export function repeatStateAndData( ...actions ) {
  const res = {
    type: 'repeatState',
    actions,
  }
  log.info( 'repeatState: %j', res )
  return res
}

export function keepState( newData, ...actions ) {
  const res = {
    type: 'keepState',
    newData,
    actions,
  }
  log.info( 'keepState: %j', res )
  return res
}

export function keepStateAndData( ...actions ) {
  const res = {
    type: 'keepState',
    actions,
  }
  log.info( 'keepStateAndData: %j', res )
  return res
}
