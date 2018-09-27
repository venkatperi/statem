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


export type Primitive = number | string | boolean | null | undefined

export type PrimitiveObject = { [k in string]: Primitive }

export type NamedPrimitiveObject = {
    name: string,
    [k: string]: Primitive
}

export type EventType =
    'call'
    | 'cast'
    | 'enter'
    | 'eventTimeout'
    | 'stateTimeout'
    | 'genericTimeout'
    | 'internal'

export type ActionType =
    'reply'
    | 'nextEvent'
    | 'postpone'
    | 'stateTimeout'
    | 'eventTimeout'
    | 'genericTimeout'

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

export type EventContext = Primitive | PrimitiveObject

export type EventExtra = any

export type From = string

export type Timeout = number | string

export type HandlerOpts<TData> = {
    args: { [k in string]: string },
    current: State,
    data: TData,
    event: Event,
    route: string
}

export type HandlerFn<TData> =
    (opts: HandlerOpts<TData>) => HandlerResult<TData>

export type NextStateWithEventTimeout = [State, Timeout]

/**
 * Route handler. Can be a function, a state or a
 * [state, event timeout] tuple
 */
export type Handler<TData> =
    HandlerFn<TData>
    | State
    | NextStateWithEventTimeout

export type HandlerRoute = string | Array<string>

/**
 * Maps a handler to a route (or list or routes)
 */
export type HandlerSpec<TData> =
    [HandlerRoute, Handler<TData>]
    | { [k in string]: Handler<TData> }

/**
 * List of route handlers
 */
export type Handlers<TData> = Array<HandlerSpec<TData>>

export type RouteHandler<TData> = {
    routes: Array<[string, Route]>,
    handler: Handler<TData>
}

export type RouteHandlers<TData> = Array<RouteHandler<TData>>

export type MatchedHandler<TData> = {
    routeHandler: Handler<TData>,
    route: string,
    result: { [k in string]: string }
}

export type HandlerResult<TData> =
    Result
    | ResultWithData<TData>
    | ResultBuilder
    | void

export enum Priority {
    Highest = 1000,
    High = 2000,
    Normal = 3000,
    Low = 4000,
    Lowest = 5000,
}

