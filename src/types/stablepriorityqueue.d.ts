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


type Timeout = string | number
type TimerOpts = {
    name: string,
    timeout: Timeout,
    auto?: boolean,
    repeat?: number
}

declare module 'ntimer' {
    import EventEmitter = require('events')

    namespace ntimer {

        class Timer extends EventEmitter {
            constructor(opts: TimerOpts)

            start(): Timer

            cancel(): Timer
        }

        function auto(name: string, timeout: Timeout): Timer

        function repeat(name: string, timeout: Timeout, repeat: number): Timer

        function autoRepeat(name: string, timeout: Timeout,
            repeat: number): Timer
    }

    function ntimer(name: string, timeout: Timeout): ntimer.Timer

    export = ntimer
}
