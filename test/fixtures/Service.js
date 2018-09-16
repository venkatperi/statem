//  Copyright 2018, Venkat Peri.
n
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


import {
  keepStateAndData,
  nextState,
  reply,
  StateMachine,
} from '../../';

export default class Service extends StateMachine {

  initialState = 'new'

  handlers = {
    'cast#next#new': ( event, args, current, data ) =>
      nextState( 'starting', data ),

    'cast#next#starting': ( event, args, current, data ) =>
      nextState( 'running', data ),

    'cast#error(/:error)#starting': ( event, args, current, data ) =>
      nextState( 'cancelling', Object.assign( {}, data, { error: args.error } ) ),

    'cast#next#cancelling': ( event, args, current, data ) =>
      nextState( 'failed', data ),

    'cast#next#running': ( event, args, current, data ) =>
      nextState( 'stopping', data ),

    'cast#next#stopping': ( event, args, current, data ) =>
      nextState( 'terminated', data ),

    'cast#error(/:error)#stopping': ( event, args, current, data ) =>
      nextState( 'failed', Object.assign( {}, data, { error: args.error } ) ),

    'call/:from#getState#:state': ( event, args, current, data ) =>
      keepStateAndData( reply( args.from, current ) ),
  }

  flip() {
    this.cast( 'flip' )
  }

  async getCount() {
    return await this.call( 'getCount' )
  }

  async getState() {
    return await this.call( 'getState' )
  }

}
