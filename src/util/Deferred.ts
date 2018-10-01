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
export type Resolver<T> = (value?: T | PromiseLike<T>) => void

/**
 * @hidden
 */
export type Rejector = (reason?: any) => void

/**
 * @hidden
 */
export type FulfillmentHandler<T, R = T> = ((value: T) => (PromiseLike<R> | R))

/**
 * @hidden
 */
export type RejectionHandler<R = never> = (reason: any) => (PromiseLike<R> | R)

/**
 * @hidden
 */
export default class Deferred<T> implements Promise<T> {
    /**
     *  A method to resolve the associated Promise with the value passed.
     * If the promise is already settled it does nothing.
     *
     * @param  value - this value is used to resolve the promise
     * If the value is a Promise then the associated promise assumes the state
     * of Promise passed as value.
     */
    resolve: Resolver<T> = () => {
        throw new Error("Not initialized")
    }

    /**
     *  A method to reject the associated Promise with the value passed.
     * If the promise is already settled it does nothing.
     *
     * @param reason: the reason for the rejection of the Promise.
     * Generally its an Error object. If however a Promise is passed, then the
     *     Promise itself will be the reason for rejection no matter the state
     *     of the Promise.
     */
    reject: Rejector = () => {
        throw new Error("Not initialized")
    }

    /**
     * The {Promise<T>>} underlying this Deferred<T>
     */
    promise: Promise<T>

    completed: boolean = false

    /**
     * Implementation from Promise<T>
     */
    readonly [Symbol.toStringTag]: "Promise";

    /**
     * Creates a new Deferred object
     */
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

    /**
     * Return a Deferred in already resolved state
     *
     * @param value
     * @return {Deferred<T>}
     */
    static resolved<T>(value?: T | PromiseLike<T>) {
        let d = new Deferred<T>()
        d.resolve(value)
        return d
    }

    /**
     * Returns a Deferred in already rejected state
     *
     * @return {Deferred<T>}
     * @param reason
     */
    static rejected<T>(reason?: any) {
        let d = new Deferred<T>()
        d.reject(reason)
        return d
    }

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @returns {Promise<T | R>} Promise for the completion of the callback.
     * @param onRejected handles rejection
     */
    catch<R = never>(onRejected?: RejectionHandler<R> | null | undefined): Promise<T | R> {
        return this.promise.catch(onRejected)
    }

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @returns {Promise<R1 | R2>} Promise for the completion of which ever
     *     callback is executed.
     * @param onFulfilled handles fulfillment
     * @param onRejected handles rejection
     */
    then<R1 = T, R2 = never>(
        onFulfilled?: FulfillmentHandler<T, R1> | null | undefined,
        onRejected?: RejectionHandler<R2> | null | undefined): Promise<R1 | R2> {
        return this.promise.then(onFulfilled, onRejected)
    }
}

