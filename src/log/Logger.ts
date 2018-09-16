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

import {prefix, pz2, pz3} from "./utils";
import {Level, levels} from "./levels";

const minLevel = levels[process.env.LOG_LEVEL || 'info'].level


export abstract class Logger {
    tag: string
    sep: string

    /**
     *
     * @param tag
     * @param prefixLen
     * @param sep
     */
    constructor(tag: string, {prefixLen = 12, sep = ' '} = {}) {
        this.tag = prefix(tag, prefixLen)
        this.sep = sep
    }

    /**
     *
     * @param level
     */
    formatLevel(level: Level): string {
        return level[0].toUpperCase()
    }

    /**
     *
     * @param t
     * @return {string}
     */
    formatTime(t: Date = new Date()): string {
        return `${pz2(t.getMonth())}-${pz2(t.getDate())} ${pz2(t.getHours())}:${pz2(t.getMinutes())}:${pz2(t.getSeconds())}:${pz3(t.getMilliseconds())}`
    }

    /**
     *
     * @param level
     * @return {string}
     */
    formatPrefix(level: Level): string {
        const l = this.formatLevel(level)
        return `${l}/${this.formatTime()}/${this.tag}`
    }

    /**
     *
     * @param level
     * @param msg
     * @param args
     * @return {string}
     */
    format(level: Level, msg: string, ...args): string {
        let a = args.map(x => typeof x === 'object' ? JSON.stringify(x) : x.toString())
        return `${this.formatPrefix(level)} - ${msg} ${a.join(this.sep)}`
    }

    /**
     *
     * @param level
     * @param msg
     * @param args
     */
    abstract log(level: Level, msg: string, ...args)

    doLog(level: Level, msg: string, ...args) {
        if (levels[level].level >= minLevel)
            this.log(level, msg, args)
    }

    /**
     *
     * @param msg
     * @param args
     */
    debug(msg, ...args) {
        this.doLog('debug', msg, ...args)
    }

    d(msg, ...args) {
        this.doLog('debug', msg, ...args)
    }

    verbose(msg, ...args) {
        this.doLog('verbose', msg, ...args)
    }

    v(msg, ...args) {
        this.doLog('verbose', msg, ...args)
    }

    info(msg, ...args) {
        this.doLog('info', msg, ...args)
    }

    i(msg, ...args) {
        this.doLog('info', msg, ...args)
    }

    warn(msg, ...args) {
        this.doLog('warn', msg, ...args)
    }

    w(msg, ...args) {
        this.doLog('warn', msg, ...args)
    }

    error(msg, ...args) {
        this.doLog('error', msg, ...args)
    }

    e(msg, ...args) {
        this.doLog('error', msg, ...args)
    }
}
