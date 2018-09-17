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

import Route = require("route-parser");
import RouteResult from "./RouteResult";
import {Parsers} from "./types";
import Logger from "../Logger";


const Log = Logger('RouteParser')

export default class RouteParser {
    route: string
    parsers: Parsers

    constructor(route: string) {
        this.route = route
        this.init()
    }

    /**
     * Creates the underlying parsers
     */
    protected init() {
        let [event, context, state] = this.route.split('#')
        Log.i('init', event, context, state)
        this.parsers = {
            event: new Route(`/${event}`),
            context: new Route(`/${context}`),
            state: new Route(`/${state}`)
        }
        Log.i('init', this.parsers)
    }

    parse(route: string): RouteResult {
        let [event, context, state] = route.split('#')
        Log.i('parse', event, context, state)
        return new RouteResult({
            event: this.parsers.event.match(`${event}`),
            context: this.parsers.context.match(`/${context}`),
            state: this.parsers.state.match(`/${state}`),
        })
    }
}

