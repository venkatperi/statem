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

export default class Deferred<T> implements Promise<T> {
    /**
     *  A method to resolve the associated Promise with the value passed.
     * If the promise is already settled it does nothing.
     *
     * @param  value - this value is used to resolve the promise
     * If the value is a Promise then the associated promise assumes the state
     * of Promise passed as value.
     */
    resolve: (value?: T) => void

    /**
     *  A method to reject the associated Promise with the value passed.
     * If the promise is already settled it does nothing.
     *
     * @param reason: the reason for the rejection of the Promise.
     * Generally its an Error object. If however a Promise is passed, then the Promise
     * itself will be the reason for rejection no matter the state of the Promise.
     */
    reject: (any) => void

    /**
     * The {Promise<T>>} underlying this Deferred<T>
     */
    promise: Promise<T>

    completed: boolean = false

    constructor() {
        let that = this
        this.promise = new Promise(function (resolve, reject) {
            that.resolve = resolve;
            that.reject = reject;
        })

        this.promise.then(() => {
            that.completed = true
        }).catch(() => {
            that.completed = true
        })
    }

    readonly [Symbol.toStringTag]: "Promise";

    catch<TResult = never>(onrejected?: ((reason: any) => (PromiseLike<TResult> | TResult)) | null | undefined): Promise<T | TResult> {
        return this.promise.catch(onrejected)
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => (PromiseLike<TResult1> | TResult1)) | null | undefined, onrejected?: ((reason: any) => (PromiseLike<TResult2> | TResult2)) | null | undefined): Promise<TResult1 | TResult2> {
        return this.promise.then(onfulfilled, onrejected)
    }
}

