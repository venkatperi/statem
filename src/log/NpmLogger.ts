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

import * as npmlog from 'npmlog'
import {Logger} from "./Logger";
import {levels} from "./levels";


Object.entries(levels).forEach(([k, v]) => npmlog.addLevel(k, v.level, v.style, v.disp))

// @ts-ignore
npmlog.level = global._logLevel || 'info';
// @ts-ignore
npmlog.prefixStyle = {fg: 'grey'}


export class NpmLogger extends Logger {
    tag: string

    debug(msg, ...args) {
        npmlog['debug'](this.tag, ...args)
    }

    error(msg, ...args) {
        npmlog.error(this.tag, msg, ...args)
    }

    info(msg, ...args) {
        npmlog['info'](this.tag, msg, ...args)
    }

    warn(msg, ...args) {
        npmlog['warn'](this.tag, msg, ...args)
    }

    verbose(msg, ...args) {
        npmlog['verbose'](this.tag, msg, ...args)
    }
}
