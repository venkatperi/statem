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


/**
 * @hidden
 */
interface Array<T> {

    /**
     * Like Array.find(), applies callback fn() on successive array entries and
     * returns the first value that is non null
     *
     * @param fn
     */
    findValue<T, V>(fn: (item: T) => V | undefined): V | undefined
}

((proto: any) => {
    if (typeof proto.findValue === "function") {
        return;
    }

    proto.findValue = function findValue<T, V>(this: Array<T>,
        fn: (item: T, index: number,
            array: Array<T>) => V | undefined): V | undefined {
        for (let i = 0; i < this.length; i++) {
            const ret = fn(this[i], i, this)
            if (ret) {
                return ret
            }
        }
        return undefined
    }
})(Array.prototype)

