// @flow
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
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN type OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

import Route from 'route-parser'
import type {Actions} from 'src/action/Action';

import Logger from '../Logger';
import {
  CallEvent,
  CastEvent,
  Event,
  EventContext,
} from './event/Event';
import {Responses} from './Responses';
import type {
  KeepStateResult,
  NextStateResult,
  RepeatStateResult,
} from './result/Result';

import type {
  Data,
  Handler,
  Reply,
  RouteHandler,
  State,
} from './types';

const log = Logger( 'StateMachine' )

export default class StateMachine {
  handlers = {}
  initialState: State

  _data: Data
  _responses = new Responses()
  _state: State
  _routes: Array<RouteHandler> = []

  _resultHandlers = {
    'nextState': this._handleNextStateResult.bind( this ),
    'nextStateWithData': this._handleNextStateResult.bind( this ),
    'keepState': this._handleKeepStateResult.bind( this ),
    'repeatState': this._handleRepeatStateResult.bind( this ),
  }

  get state(): State {
    return this._state
  }

  get data(): Data {
    return this._data
  }

  set state( state: State ) {
    log.info( `state=${state}` )
    this._state = state
  }

  set data( data: Data ) {
    this._data = data
  }

  /**
   * Makes a call and waits for its reply.
   *
   */
  async call( request: EventContext, timeout: number = Infinity ) {
    const [from, promise] = this._responses.create()

    const result = this._handleEvent( new CallEvent( from, request ) )
    this._handleResult( result )
    return await promise
  }

  /**
   * Sends an asynchronous request to the server.
   * This function always returns regardless of whether the
   * request was successful or handled by the StateMachine.
   *
   * The appropriate state function will be called to handle the request.
   */
  cast( request: EventContext ) {
    try {
      const result = this._handleEvent( new CastEvent( request ) )
      this._handleResult( result )
    } catch ( e ) {
      console.log( e )
      // ignore error for cast
    }
  }

  /**
   * Starts the state machine
   *
   * @param options
   */
  start( options: ?Object ) {
    this._initHandlers()
    this.state = this.initialState
    this.onInit( options )
  }

  /**
   * Stops the state machine
   *
   * @param reason
   * @param timeout
   */
  stop( reason: string, timeout: number ) {
  }

  /**
   * This function is called by default to handle calls or casts
   * if no specific handler exists.
   *
   * @param event
   * @param args {Object}
   * @param state
   * @param data {Object}
   */
  handleEvent( event: Event, args: Object, state: State, data: ?Object ) {
    throw new Error( `no handler for ${event}: ${args}` )
  }

  /**
   * Called when the server is started
   *
   * @param opts
   */
  onInit( opts ) {
  }

  /**
   * Invoked when the server is about to exit. It should do any
   * cleanup required.
   *
   * @param reason {String} is exit reason
   * @param state {State} state is the current state,
   * @param data {Object} data is the current data
   */
  onTerminate( reason, state, data ) {
  }

  addHandler( route: string, handler: Handler ) {
    this._routes.push( { route: new Route( route ), handler } )
  }

  _initHandlers() {
    for ( let [route, handler] of Object.entries( this.handlers ) ) {
      this.addHandler( route, handler )
    }
  }

  _makeRoute( e: Event ): string {
    return `${e.route}#${this.state}`
  }

  _handleEvent( e: Event ) {
    const route = this._makeRoute( e )
    log.info( 'handleEvent: %j', route )
    for ( const r of this._routes ) {
      const res = r.route.match( route )
      if ( res ) {
        return r.handler( e, res, this.state, this.data )
      }
    }
    this.handleEvent( e, {}, this.state, this.data )
  }

  _handleResult( res ) {
    log.info( 'handleResult: %j', res )
    res.process( this )
    // if ( !res.type ) throw new Error( `result has no type: ${res}` )
    // return this._resultHandlers[res.type]( res )
  }

  _handleNextStateResult( res: NextStateResult ) {
    this.state = res.nextState
    if ( res.newData != null )
      this.data = res.newData

    for ( let a of (res.actions || []) ) {
      this._handleAction( a )
    }
  }

  _handleKeepStateResult( res: KeepStateResult ) {
    if ( res.newData != null )
      this.data = res.newData

    for ( let a of (res.actions || []) ) {
      this._handleAction( a )
    }
  }

  _handleRepeatStateResult( res: RepeatStateResult ) {
    if ( res.newData != null )
      this.data = res.newData

    for ( let a of (res.actions || []) ) {
      this._handleAction( a )
    }
  }

  handleActions( actions: ?Actions ) {
    actions = Array.isArray( actions ) ? actions : [actions]
    for ( let a of actions ) {
      this._handleAction( a )
    }
  }

  _handleAction( a ) {
    switch ( a.type ) {
      case 'reply':
        this._handleReplyAction( a )
        break
    }
  }

  _handleReplyAction( a
                        :
                        Reply,
  ) {
    this._responses.resolve( a.from, a.reply )
  }
}


