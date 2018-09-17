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


import Event from "./event";
import Result from "./result/Result";
import ResultBuilder from "./result/builder";
import Route = require("route-parser");

import ntimer = require('ntimer');
import NTimer = ntimer.Timer;

export type State = string

export type Data = any;

export type EventContext = any;

export type From = string;


export type HandlerOpts = {
    event: Event,
    args: Object,
    current: State,
    data: Data
}

export type Handler = (HandlerOpts) => Result | ResultBuilder

export type Handlers = {
    [K in string]: Handler
}

export type RouteHandler = {
    route: Route,
    handler: Handler
}

export type RouteHandlers = Array<RouteHandler>

export type Timer = 'state' | 'event' | 'generic'
export type Timers = {
    [k in keyof Timer]?: NTimer
}



