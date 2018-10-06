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


import Route = require("route-parser")
import Event from "./event"
import Result from "./result"
import ResultBuilder from "./result/builder"
import ResultWithData from "./result/ResultWithData"
import { State } from "./State"


/**
 * Our definition of primitives (doesn't include symbol)
 */
export type Primitive = number | string | boolean | null | undefined

/**
 * Object with string keys and primitive values
 */
export type PrimitiveObject = { [k in string]: Primitive }

/**
 * Like {PrimitiveObject}, but expects a key 'name'
 */
export type NamedPrimitiveObject = {
    name: string,
    [k: string]: Primitive
}

/**
 * State machine events
 */
export type EventType =
    'call'
    | 'cast'
    | 'enter'
    | 'eventTimeout'
    | 'stateTimeout'
    | 'genericTimeout'
    | 'internal'

/**
 * Transition actions
 */
export type ActionType =
    'reply'
    | 'nextEvent'
    | 'postpone'
    | 'stateTimeout'
    | 'eventTimeout'
    | 'genericTimeout'
    | 'emit'

/**
 * Hander results
 */
export type ResultType =
    'none'
    | 'keepState'
    | 'keepStateAndData'
    | 'nextState'
    | 'nextStateWithData'
    | 'repeatState'
    | 'repeatStateAndData'
    | 'stop'
    | 'builder'

/**
 * Events can accept simple arguments of type {Primitive}, or a
 * {PrimitiveObject}
 */
export type EventContext = Primitive | PrimitiveObject

/**
 * Non {Primitive|PrimitiveObject} arguments to events.
 */
export type EventExtra = any

/**
 * The caller's address for a {CallEvent}
 */
export type From = string

/**
 * Timeout values. Milliseconds if {number}. For string values, see {NTimer}
 */
export type Timeout = number | string

/**
 * Values passed to a {Handler}
 */
export type HandlerOpts<TData> = {
    args: { [k in string]: string },
    current: State,
    data: TData,
    event: Event,
    route: string
}

/**
 * Handler function
 */
export type HandlerFn<TData> =
    (opts: HandlerOpts<TData>) => HandlerResult2<TData>

export type HandlerResult2<TData> = HandlerResult<TData>
    | Promise<HandlerResult<TData>>

/**
 * Handlers can be specified as a tuple of the next {State} and a
 * {EventTimeout}
 */
export type NextStateWithEventTimeout = [State, Timeout]

/**
 * Route handler. Can be a function, a state or a
 * [state, event timeout] tuple
 */
export type Handler<TData> =
    HandlerFn<TData>
    | State
    | NextStateWithEventTimeout

/**
 * The key of a handler. Can be {string|Array<string>}. If {Array<string>},
 * the routes are treated as a boolean OR. Any matching route in the array
 * will invoke the handler.
 */
export type HandlerRoute = string | Array<string>

/**
 * A {HandlerRoute} to {Handler} entry. Can be a tuple or object with string
 * keys. If an object, the keys are treated as {string} routes.
 */
export type HandlerSpec<TData> =
    [HandlerRoute, Handler<TData>]
    | { [k in string]: Handler<TData> }

/**
 * List of route handlers
 */
export type Handlers<TData> = Array<HandlerSpec<TData>>

/**
 * @hidden
 */
export type RouteHandler<TData> = {
    routes: Array<[string, Route]>,
    handler: Handler<TData>
}

/**
 * @hidden
 */
export type RouteHandlers<TData> = Array<RouteHandler<TData>>

/**
 * @hidden
 */
export type MatchedHandler<TData> = {
    routeHandler: Handler<TData>,
    route: string,
    result: { [k in string]: string }
}

/**
 * Result of a handler invocation.
 * {ResultBuilder.getResult()}  is invoked to convert a {ResultBuilder} to a
 * {Result}
 * {void} implies {KeepStateWithData}
 */
export type HandlerResult<TData> =
    Result
    | ResultWithData<TData>
    | ResultBuilder
    | void

/**
 * Event Priorities
 */
export enum Priority {
    Highest = 1000,
    High = 2000,
    Normal = 3000,
    Low = 4000,
    Lowest = 5000,
}

export type DataProxy<T> = {
    get(): T;
    set(value: T, state: State): void;
}
