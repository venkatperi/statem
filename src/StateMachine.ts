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
import {Data, EventContext, Handler, HandlerOpts, Handlers, RouteHandlers, State} from "./types";
import Result, {KeepStateAndData, NextState, NextStateWithData} from "./result";
import Pending from "./util/Pending";
import Event, {
    CallEvent,
    CastEvent,
    EnterEvent,
    EventTimeoutEvent,
    GenericTimeoutEvent,
    StateTimeoutEvent
} from "./event";
import Action, {Reply, Timeout} from "./action";
import ResultBuilder from "./result/builder";
import Logger from './Logger'
import Timers from "./util/Timers";
import {keepState} from "../index";

const Log = Logger('StateMachine')

type SMOptions = {
    initialState?: State,
    handlers?: Handlers,
    data?: Data,
}

export default class StateMachine extends EventEmitter {
    initialState: State
    handlers: Handlers

    defaultHandlers = {
        // Get the current state
        'call/:from#getState#:state': ({args, current}) =>
            keepState().reply(args.from, current),

        // Get the current data
        'call/:from#getData#:state': ({args, data}) =>
            keepState().reply(args.from, data),
    }

    protected _routeHandlers: RouteHandlers = []
    protected _state: State
    protected _data: Data
    protected _pending = new Pending()
    private timers = new Timers()
    private events: Array<Event> = []
    private processingEvent = false

    constructor({initialState, handlers, data}: SMOptions = {}) {
        super()
        if (initialState)
            this.initialState = initialState
        if (handlers)
            this.handlers = handlers
        if (data)
            this.data = data
    }

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
        let old = this._data
        this._data = value;
        this.emit('data', value, old)
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
        Log.i('state', s)
        let old = this._state
        this._state = s
        this.emit('state', s, old)
        if (old !== s) {
            this.emit('stateChanged', s, old)
        }
    }


    /**
     * Starts the state machine
     *
     * @param options
     * @return {this}
     */
    start(options: object = {}) {
        Log.i('start')
        let that = this
        this.on('stateTimeout', (a: Timeout) =>
            that.addEvent(new StateTimeoutEvent(a.time, {time: a.time}), true))
            .on('eventTimeout', (a: Timeout) =>
                that.addEvent(new EventTimeoutEvent(a.time, {time: a.time}), true))
            .on('genericTimeout', (a: Timeout) =>
                that.addEvent(new GenericTimeoutEvent(a.time, {time: a.time}), true))
            .on('state', (s, old) =>
                that.addEvent(new EnterEvent({old: old || this.initialState}), true))

        this._initHandlers()
        this.state = this.initialState
        this.emit('init', options)
        return this
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

        this.addEvent(new CallEvent(from, request))
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
            this.addEvent(new CastEvent(request))
        } catch (e) {
            // ignore error for cast
            Log.e(e)
        }
    }

    /**
     *
     * @param route
     * @param handler
     * @return {this}
     */
    addHandler(route: string, handler: Handler): StateMachine {
        Log.v(`addHandler`, route, handler)
        this._routeHandlers.push({route: new Route(route), handler})
        return this
    }

    /**
     *
     * @param event
     * @param args
     * @param current
     * @param data
     */
    handleDefaultEvent({event, args, current, data}: HandlerOpts): Result {
        Log.i('defaultHandler', event, args)
        return new KeepStateAndData()
        // throw new Error(`no handler for ${event}: ${args}`)
    }

    protected _initHandlers() {
        let h = Object.assign({}, this.handlers, this.defaultHandlers)
        for (let [route, handler] of Object.entries(h)) {
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
     */
    protected handleEvent(event: Event) {
        this.processingEvent = true
        this.emit('event', event)
        const h = this.getRouteHandler(event)
        const args = {
            event,
            args: h ? h.result : {},
            current: this.state,
            data: this.data
        }

        Log.i('handleEvent', args)

        let res = h ?
            h.routeHandler.handler(args) :
            this.handleDefaultEvent(args);

        this.handleResult(res)
        this.processingEvent = false
        this.processEvents()
    }

    /**
     * Add event to the queue
     * @param event
     * @param front if true, adds to the front of the queue instead of the end
     */
    addEvent(event: Event, front = false) {
        Log.i('addEvent', event, front)
        if (front)
            this.events.unshift(event)
        else
            this.events.push(event)
        this.processEvents()
    }

    processEvents() {
        setImmediate(this._processEvents.bind(this))
    }

    _processEvents() {
        if (this.events.length === 0 || this.processingEvent)
            return
        Log.i('processEvents', this.events)
        this.handleEvent(this.events.shift())
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

        res.actions.forEach(this.handleAction.bind(this))
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
        else if (action instanceof Timeout) {
            this.manageTimer(action)
        }
    }

    manageTimer(action: Timeout) {
        Log.i('manageTimer', action.type, action)
        let that = this

        this.timers.cancel(action.type)

        this.timers.create(action.time, action.type, action)
        this.timers.on(action.type, () =>
            that.emit(action.type, action))
    }

    async getState(): Promise<State> {
        return await this.call('getState')
    }

    async getData() {
        return await this.call('getData')
    }

}
