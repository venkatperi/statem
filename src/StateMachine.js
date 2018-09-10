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

import Logger from '../Logger';
import {Event} from './Event';
import {Responses} from './Responses';
import type {
  KeepStateResult,
  NextStateResult,
  RepeatStateResult,
} from './Result';
import type {
  Data,
  Handler,
  Reply,
  RouteHandler,
  State,
} from './types';

const log = Logger( 'Result' )

export default class StateMachine {

  events: Array<Event> = []
  routes: Array<RouteHandler> = []
  handlers = {}
  initialState: State
  state: State
  data: Data
  responses = new Responses()

  _resultHandlers = {
    'nextState': this._handleNextStateResult.bind(this),
    'keepState': this._handleKeepStateResult.bind(this),
    'repeatState': this._handleRepeatStateResult.bind(this),
  }

  /**
   * Makes a synchronous call and waits for its reply.
   *
   */
  async call( request: any, timeout: number = Infinity ) {
    const [from, promise] = this.responses.create()

    const result = this._handleEvent( Object.assign( {
      type: `call/${from}`,
      context: request,
      // args: { from },
    } ) )
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
  cast( request: any ) {
    try {
      const result = this._handleEvent( Object.assign( {
        type: 'cast',
        context: request,
      } ) )
      this._handleResult( result )
    } catch ( e ) {
      console.log( e )
      // ignore error for cast
    }
  }

  /**
   * Replies to a client.
   *
   * This function can be used to explicitly send a reply to
   * a client that called call() when the reply cannot be
   * specified in the return value of a state function.
   *
   * The function always returns successfully.
   *
   * @param client
   * @param reply
   */
  reply( client, reply: Reply ) {
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

  stop( reason: string, timeout: number ) {
  }

  /**
   * This function is called by default to handle calls or casts
   * if no specific handler exists.
   *
   * @param event
   * @param state
   * @param data {Object}
   */
  handleEvent( event: Event, state: State, data: ?Object ) {
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
    this.routes.push( { route: new Route( route ), handler } )
  }

  _initHandlers() {
    for ( let [route, handler] of Object.entries( this.handlers ) ) {
      this.addHandler( route, handler )
    }
  }

  _makeRoute( e ): string {
    let x = e.args ? Object.entries( e.args ).map( ( [k, v] ) => `${k}/${v}` ) : undefined
    const eventArgs = x ? `/${x}` : ''

    const route = typeof(e.context) === 'object' ?
      Object.entries( e.context ).map( ( [k, v] ) => `${k}/${v}` ) :
      e.context
    return `${e.type}${eventArgs}#${route}#${this.state}`
  }

  _addEvents( ...events ) {
    this.events = this.events.concat( ...events )
    this._handleEvents()
  }

  _handleEvents() {
    for ( const e of this.events ) {
      this._handleEvent( e )
    }
  }

  _handleEvent( e ) {
    const route = this._makeRoute( e )
    log.info('handleEvent: %j', route)
    for ( const r of this.routes ) {
      const res = r.route.match( route )
      if ( res ) {
        return r.handler( e, res, this.state, this.data )
      }
    }
    throw new Error( `no matching route! ${route}` )
  }

  _handleResult( res ) {
    log.info('handleResult: %j', res)
    if ( !res.type ) throw new Error( `result has no type: ${res}` )
    return this._resultHandlers[res.type]( res )
  }

  _handleNextStateResult( res: NextStateResult ) {
    this._setState( res.nextState )
    if ( res.newData != null )
      this._setData( res.newData )

    for ( let a of (res.actions || []) ) {
      this._handleAction( a )
    }
  }


  _handleKeepStateResult( res: KeepStateResult ) {
    if ( res.newData != null )
      this._setData( res.newData )

    for ( let a of (res.actions || []) ) {
      this._handleAction( a )
    }
  }


  _handleRepeatStateResult( res: RepeatStateResult ) {
    if ( res.newData != null )
      this._setData( res.newData )

    for ( let a of (res.actions || []) ) {
      this._handleAction( a )
    }
  }


  _setState( state ) {
    this.state = state
  }

  _setData( data ) {
    this.data = data
  }

  _handleAction( a ) {
    switch ( a.type ) {
      case 'reply':
        this._handleReplyAction( a )
        break
    }
  }

  _handleReplyAction( a: Reply ) {
    this.responses.resolve( a.from, a.reply )
  }
}


