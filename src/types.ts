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
import Event from "./event";
import Result from "./result";
import ResultBuilder from "./result/builder";
import { State } from "./State";


export type Primitive = number | string | boolean | null | undefined

export type PrimitiveObject = { [k in string]: Primitive }

export type NamedPrimitiveObject = {
    name: string,
    [k: string]: Primitive
}

export type Data = any;

export type EventType = string

export type ActionType = string

export type ResultType = string

export type EventContext = Primitive | PrimitiveObject

export type EventExtra = any;

export type From = string;

export type Timeout = number | string;

export type HandlerOpts = {
    event: Event,
    args: { [k in string]: string },
    current: State,
    data: Data,
    route: string
}

export type HandlerResult = Result | ResultBuilder | void

export type HandlerFn = (handler: HandlerOpts) => HandlerResult

export type StateWithTimeout = [State, Timeout]

export type Handler = HandlerFn | State | StateWithTimeout

export type Handlers = Array<[string | Array<string>, Handler]>

export type RouteHandler = {
    routes: Array<[string, Route]>,
    handler: Handler
}

export type RouteHandlers = Array<RouteHandler>

export type MatchArgs = {
    current: State;
    data: Data;
    event: Event,
    args?: object,
    route?: string
}

export type MatchedHandler = {
    routeHandler: RouteHandler,
    route: string,
    result: { [k in string]: string }
}

export enum Priority {
    Highest = 1000,
    High = 2000,
    Normal = 3000,
    Low = 4000,
    Lowest = 5000,
}

