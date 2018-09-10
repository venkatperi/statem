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


import {StateMachine} from '../../';

export default class Lock extends StateMachine {

  handlers = {
    'cast#button/:digit#locked': ( event, args, state ) => {
      console.log( args )
    },
  }

  initialState = { name: 'locked' }


  /**
   def button(lock, digit),
   do: GenStateMachine.cast(lock, {:button, digit})

   def code_length(lock),
   do: GenStateMachine.call(lock, :code_length)

   def lock(lock),
   do: GenStateMachine.call(lock, :lock)

   def status(lock),
   do: GenStateMachine.call(lock, :status)
   */

  button( digit ) {
    this.cast( { button: digit } )
  }

  get codeLength(): number {
    this.call( 'codeLength' )
  }

  lock() {
    this.call( 'lock' )
  }

  get status() {
    this.call( 'status' )
  }

}
