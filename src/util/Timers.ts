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
import ntimer = require('ntimer');
import NTimer = ntimer.Timer;
import {uniqId} from "./uniqId";
import {EventEmitter} from "events";


export default class Timers extends EventEmitter {
    timers: {
        [k in string]: NTimer
    } = {}

    /**
     * Creates a auto starting timer with the given timeout and returns its
     * name. If a name is not supplied, a random name is generated.
     *
     * @param timeout, in milliseconds
     * @param name, optional, the timer's name
     *
     * @return {string} the timer's name
     */
    create(timeout: number, name?: string, opts?): string {
        name = uniqId() || name
        if (this.timers[name])
            throw new Error(`Timer with name exists: ${name}`)
        let t = this.timers[name] = new NTimer({name, timeout, auto: true})
        let that = this
        t.on('timer', () => {
            that.cancel(name)
            that.emit(name, opts)
        })
        this.emit('addTimer', name)
        return name
    }

    /**
     * Cancels and existing timer and removes it from the list
     * Does nothing if the named timer is not in the list
     *
     * @param name, the timer's name
     * @return {boolean} true if the timer was found and cancelled
     */
    cancel(name: string): boolean {
        if (!this.timers[name]) {
            return false
        }

        this.timers[name].cancel()
        delete this.timers[name]
        this.emit('removeTimer', name)
        return true
    }
}

