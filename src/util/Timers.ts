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

import { Timer } from "ntimer";
import Logger from "../Logger";
import { Timeout } from "../types";
import { uniqId } from "./uniqId";


const Log = Logger("Timers");

export default class Timers {
    private timers: { [k in string]: Timer } = {};

    /**
     * Creates a auto starting timer with the given timeout and returns its
     * name. If a name is not supplied, a random name is generated.
     *
     * If a timer with the name exists, it is cancelled and a
     * new timer is installed
     *
     * @param timeout
     *
     * @return {module:ntimer.Timer} timer
     * @param opts
     * @param n
     */
    create(timeout: Timeout, n?: string, opts?: any): Timer {
        let that = this;

        let name = n || uniqId();

        Log.i("create", timeout, name, opts);

        this.cancel(name);
        let t = this.timers[name] = new Timer({name, timeout, auto: true});
        t.on("timer", () => that.cancel(name));
        return t;
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
            return false;
        }

        Log.i("cancel", name);
        this.timers[name].cancel();
        delete this.timers[name];
        return true;
    }

    /**
     * Gets the named timer
     * @param name
     */
    get(name: string): Timer {
        return this.timers[name];
    }
}

