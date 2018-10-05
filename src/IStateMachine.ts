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

/**
 * Public interface of a state machine.
 *
 */
export interface IStateMachine<TData> extends SMOptions<TData> {
    /**
     * Returns true is an event timer is currently set
     * @return {boolean}
     */
    readonly hasEventTimer: boolean

    /**
     * Returns true is state timer is currently set
     * @return {boolean}
     */
    readonly hasStateTimer: boolean

    /**
     * Adds a event handler for the given route.
     *
     * @param routes - The routes for which the handler will be invoked. If
     * multiple routes are specified, the handler will be invoked if any of
     * routes match against an incoming event (boolean OR).
     * @param handler - the handler to invoke when a route is matched.
     * @return {this}
     */
    addHandler(routes: string | Array<string>,
        handler: Handler<TData>): IStateMachine<TData>

    /**
     * Fires a Call event and returns a promise that resolves or rejects when
     * the state machine sends a reply (via a Reply(from)) handler action.
     *
     * The state machine generates a unique string id for each invocation
     * of `call` and provides it to the state machine as:
     * "call/uniqueId#args#state"
     *
     * @param request - the request context
     * @param extra - extra
     */
    call(request: EventContext, extra?: EventExtra): Promise<any>

    /**
     * Sends an asynchronous request to the server.
     * This function always returns regardless of whether the
     * request was successful or handled by the StateMachine.
     *
     * @param request - request context
     * @param extra
     */
    cast(request: EventContext, extra?: EventExtra): void

    /**
     * A catch-all handler invoked if no routes match an incoming event.
     *
     * @param event - the event
     * @param args - event args
     * @param current -the current state
     * @param data - the current data
     */
    defaultEventHandler({event, args, current, data}: HandlerOpts<TData>): Result | undefined

    /**
     * Returns a promise that resolves with the current data. Sugar for
     * `call('getData'). Handled by default handlers.
     */
    getData(): Promise<TData>

    /**
     * Returns a promise that resolves with the current state. Sugar for
     * `call('getState'). Handled by default handlers.
     */
    getState(): Promise<State>

    /**
     * Returns both state and data
     */
    getStateAndData(): Promise<[State, TData]>

    /**
     * Returns true if a timer with the given name is currently active
     * @param name
     */
    hasTimer(name: string): boolean

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
}
