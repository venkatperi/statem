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

import Result from "./result"
import { SMOptions } from "./SMOptions"
import { State } from "./State"
import { EventContext, EventExtra, Handler, HandlerOpts } from "./types"

export interface IStateMachine<TData> extends SMOptions<TData> {
    /**
     * Returns true is state timer is currently set
     * @return {boolean}
     */
    readonly hasStateTimer: boolean

    /**
     * Returns true is an event timer is currently set
     * @return {boolean}
     */
    readonly hasEventTimer: boolean

    /**
     * Starts the state machine
     *
     */
    startSM(): IStateMachine<TData>

    /**
     * Stops the state machine
     *
     * @param reason -- the reason for stopping
     * @param data -- if set updates the machine's data before stopping
     */
    stopSM(reason: string, data?: TData): void

    /**
     * Fires a Call event and returns a promise that resolves or rejects when
     * the state machine sends a reply (via a Reply(from)) handler action.
     *
     * The state machine generates a unique string id for each invocation
     * of `call` and provides it to the state machine as:
     * "call/uniqueId#args#state"
     *
     * @param request
     * @param extra
     */
    call(request: EventContext, extra?: EventExtra): Promise<any>

    /**
     * Sends an asynchronous request to the server.
     * This function always returns regardless of whether the
     * request was successful or handled by the StateMachine.
     *
     * @param request
     * @param extra
     */
    cast(request: EventContext, extra?: EventExtra): void

    /**
     *
     * @param handler
     * @return {this}
     * @param routes
     */
    addHandler(routes: string | Array<string>,
        handler: Handler<TData>): IStateMachine<TData>

    /**
     *
     * @param event
     * @param args
     * @param current
     * @param data
     */
    defaultEventHandler({event, args, current, data}: HandlerOpts<TData>): Result | undefined

    /**
     *
     */
    getState(): Promise<State>

    /**
     *
     */
    getData(): Promise<TData>

    /**
     *
     * @param name
     */
    cancelTimer(name: string): void

    /**
     *
     * @param name
     */
    hasTimer(name: string): boolean
}
