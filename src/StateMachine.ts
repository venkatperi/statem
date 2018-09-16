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
import EventEmitter = require('events');
import {Data, EventContext, State} from "./types";
import Result from "./result/result";
import Pending from "./util/Pending";
import Event, {Events} from "./event";

import logger from './log'
import Action from "./action/Action";
import Reply from "./action/Reply";
import NextEvent from "./action/NextEvent";
import {ResultBuilder} from "./result/builder/ResultBuilder";
import NextState from "./result/NextState";
import NextStateWithData from "./result/NextStateWithData";

const Log = logger('StateMachine')

type HandlerOpts = {
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

export default class StateMachine extends EventEmitter {
    initialState: State
    handlers: Handlers

    protected _routeHandlers: RouteHandlers = []
    protected _state: State
    protected _data: Data
    protected _pending = new Pending()

    /**
     * Gets the current {Data} of this {StateMachine}
     * @return {Data} the current data
     */
    get data(): Data {
        return this._data;
    }

    /**
     * Sets the current {Data}
     * @param value the {Data}
     */
    set data(value: Data) {
        Log.i('setData', value)
        this._data = value;
    }

    /**
     *  Gets the current state
     * @return {State}
     */
    get state(): State {
        return this._state
    }

    /**
     * Sets the current state
     * @param s
     */
    set state(s: State) {
        Log.i('setState', s)
        this._state = s
    }

    /**
     * Starts the state machine
     *
     * @param options
     */
    start(options: object) {
        Log.i('start')
        this._initHandlers()
        this.state = this.initialState
        this.emit('init', options)
    }

    /**
     * Stops the state machine
     *
     * @param reason
     * @param timeout
     */
    stop(reason?: string, timeout?: number) {
        Log.i(`stop: ${reason}`)
        this.emit('terminate', reason)
    }

    /**
     * Makes a call and waits for its reply.
     *
     * @param request
     * @param timeout
     * @return {Promise<any>}
     */
    async call(request: EventContext, timeout: number = Infinity): Promise<any> {
        const from = this._pending.create()
        Log.i(`call`, request, from)

        this.handleEvent(Events.call(from, request))
        return await this._pending.get(from)
    }

    /**
     * Sends an asynchronous request to the server.
     * This function always returns regardless of whether the
     * request was successful or handled by the StateMachine.
     *
     * The appropriate state function will be called to handle the request.
     * @param request
     */
    cast(request: EventContext): void {
        Log.i(`cast`, request)
        try {
            this.handleEvent(Events.cast(request))
        } catch (e) {
            // ignore error for cast
            Log.e(e)
        }
    }

    /**
     *
     * @param route
     * @param handler
     */
    addHandler(route: string, handler: Handler) {
        Log.v(`addHandler`, route, handler)
        this._routeHandlers.push({route: new Route(route), handler})
    }

    /**
     *
     * @param event
     * @param args
     * @param current
     * @param data
     */
    handleDefaultEvent({event, args, current, data}: HandlerOpts): Result {
        throw new Error(`no handler for ${event}: ${args}`)
    }

    protected _initHandlers() {
        for (let [route, handler] of Object.entries(this.handlers)) {
            this.addHandler(route, handler)
        }
    }

    /**
     * Returns a route for the given event
     * @param e the event
     * @return {string} the route
     */
    protected makeRoute(e: Event): string {
        return `${e.route}#${this.state}`
    }

    /**
     *
     * @param e
     * @return {{routeHandler: RouteHandler; result: {[p: string]: string}}}
     */
    protected getRouteHandler(e: Event) {
        const route = this.makeRoute(e)
        Log.i('getRouteHandler', route)
        for (const routeHandler of this._routeHandlers) {
            let result = routeHandler.route.match(route)
            if (result) {
                return {routeHandler, result}
            }
        }
    }

    /**
     * Handle the given event. Matches the event's route to the
     * @param event
     * @return {Actions}
     */
    protected handleEvent(event: Event) {
        const h = this.getRouteHandler(event)
        const args = {
            event,
            args: h!.result || {},
            current: this.state,
            data: this.data
        }

        Log.i('handleEvent', h.result)

        let res = h ? h.routeHandler.handler(args) : this.handleDefaultEvent(args);
        this.handleResult(res)
    }


    /**
     *
     * @param res
     */
    protected handleResult(res: Result | ResultBuilder) {
        if (res instanceof ResultBuilder)
            res = res.result

        Log.i(`handleResult`, res)

        if (res instanceof NextState || res instanceof NextStateWithData) {
            this.state = res.nextState
        }

        if (res.hasData) {
            this.data = res.newData
        }

        res.actions!.forEach(this.handleAction.bind(this))
    }

    /**
     *
     * @param action
     */
    protected handleAction(action: Action) {
        Log.i(`handleAction`, action)

        if (action instanceof Reply) {
            this._pending.resolve(action.from, action.reply)
        }

        if (action instanceof NextEvent) {
        }
    }

}
