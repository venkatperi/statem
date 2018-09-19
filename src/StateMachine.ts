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
import StablePriorityQueue = require('stablepriorityqueue');
import {
    Data,
    EventContext,
    EventExtra,
    Handler,
    HandlerOpts,
    HandlerResult,
    Handlers,
    Priority,
    RouteHandlers,
    State,
    Timeout
} from "./types";

import Result, {KeepStateAndData, NextState, NextStateWithData} from "./result";
import Pending from "./util/Pending";
import Event, {
    CallEvent,
    CastEvent,
    EnterEvent,
    EventTimeoutEvent,
    GenericTimeoutEvent,
    makeNextEvent,
    StateTimeoutEvent
} from "./event";
import Action, {
    EventTimeoutAction,
    GenericTimeoutAction,
    NextEventAction,
    ReplyAction,
    StateTimeoutAction
} from "./action";
import ResultBuilder from "./result/builder";
import Logger from './Logger'
import Timers from "./util/Timers";
import {keepState, nextState} from "..";

const Log = Logger('StateMachine')

type SMOptions = {
    initialState?: State,
    handlers?: Handlers,
    data?: Data,
}

export default class StateMachine extends EventEmitter {
    initialState: State
    handlers: Handlers

    defaultHandlers: Handlers = [
        // Get the current state
        ['call/:from#getState#:state', ({args, current}) =>
            keepState().reply(args.from, current)],

        // Get the current data
        ['call/:from#getData#:state', ({args, data}) =>
            keepState().reply(args.from, data)],
    ]

    protected _routeHandlers: RouteHandlers = []
    protected _state: State
    protected _data: Data
    protected _pending = new Pending()
    private timers = new Timers()
    private processingEvent = false
    private events = new StablePriorityQueue((a, b) => a.priority - b.priority)

    log = {
        v: this.logger('v'),
        i: this.logger('i'),
        d: this.logger('d'),
        w: this.logger('w'),
        e: this.logger('e'),
    }

    constructor({initialState, handlers, data}: SMOptions = {}) {
        super()
        if (initialState)
            this.initialState = initialState
        if (handlers)
            this.handlers = handlers
        if (data)
            this.data = data
    }

    logger(level) {
        return (tag2, ...args) => {
            Log[level](`${tag2}/${this.state}: `, ...args)
        }
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
        this.log.i('setData', value)
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
        this.log.i('setState', s)
        let old = this._state || this.initialState
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
    startSM(options: object = {}) {
        this.log.i('start', options)

        let that = this
        let timers = this.timers
        this.on('state', (s, old) => that.addEvent(new EnterEvent({old})))
            .on('stateChanged', () => timers.cancel('stateTimeout'))
            .on('event', () => timers.cancel('eventTimeout'))

        this.initHandlers()
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
    stopSM(reason?: string, timeout?: number) {
        this.log.i(`stop: ${reason}`)
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
        this.log.i(`call`, request, from)

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
     * @param extra
     */
    cast(request: EventContext, extra?: EventExtra): void {
        this.log.v(`cast`, request)
        try {
            this.addEvent(new CastEvent(request, extra))
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
        this.log.v(`addHandler`, route, handler)

        try {
            this._routeHandlers.push({route: new Route(route), handler})
        } catch (e) {
            Log.e(e, route || 'No route!')
            throw e
        }
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
        this.log.i('defaultHandler', event.toString(), args)
        return new KeepStateAndData()
    }

    protected initHandlers() {
        let that = this
        this.handlers = this.handlers || []
        let h = this.defaultHandlers.concat(this.handlers)
        h.forEach(([route, handler]) => that.addHandler(route, handler))
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
        this.log.i('getRouteHandler', route)
        for (const routeHandler of this._routeHandlers) {
            let result = routeHandler.route.match(route)
            if (result) {
                return {routeHandler, result, route}
            }
        }
    }

    /**
     * Handle the given event. Matches the event's route to the
     * @param event
     */
    protected handleEvent(event: Event) {
        this.processingEvent = true
        const h = this.getRouteHandler(event)
        const args = {
            event,
            args: h ? h.result : {},
            current: this.state,
            data: this.data,
            route: h ? h.route : ''
        }

        this.log.i('handleEvent', event.toString(),
            {args: args.args, route: args.route})

        let result = this.getHandlerResult(h, args);
        this.handleResult(result)
        this.processingEvent = false
        this.processEvents()
    }

    private getHandlerResult(h, args) {
        if (!h) {
            return this.handleDefaultEvent(args);
        }

        let handler = h.routeHandler.handler
        if (typeof handler === 'string') {
            return nextState(handler)
        }

        if (Array.isArray(handler)) {
            return nextState(handler[0]).eventTimeout(handler[1]);
        }

        return handler(args);
    }

    /**
     * Add event to the queue. Emits the 'event' event
     *
     * @param event
     * @return {this}
     */
    addEvent(event: Event) {
        this.log.i('addEvent', event.toString())

        this.emit('event', event)
        this.events.add(event)
        this.doProcessEvents()
        return this
    }

    processEvents() {
        setImmediate(this.doProcessEvents.bind(this))
    }

    doProcessEvents() {
        if (this.events.length === 0 || this.processingEvent)
            return
        this.log.v('processEvents', this.events)
        if (!this.events.isEmpty())
            this.handleEvent(this.events.poll())
    }

    /**
     *
     * @param res
     */
    protected handleResult(res: HandlerResult) {
        if (!res)
            res = keepState()
        if (res instanceof ResultBuilder)
            res = res.result

        this.log.i(`handleResult`, res.toString())

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
        this.log.i(`handleAction`, action.toString())

        if (action instanceof ReplyAction) {
            this._pending.resolve(action.from, action.reply)
        }
        else if (action instanceof StateTimeoutAction) {
            this.setStateTimeout(action.time)
        }
        else if (action instanceof EventTimeoutAction) {
            this.setEventTimeout(action.time)
        }
        else if (action instanceof GenericTimeoutAction) {
            this.setGenericTimeout(action.time, action.name)
        }
        else if (action instanceof NextEventAction) {
            this.addNextEvent(action)
        }
        else {
            throw new Error(`No handler for action: ${action}`)
        }
    }

    /**
     * Add an event as the *next* event
     * @param action
     * @return {this}
     */
    addNextEvent(action: NextEventAction): StateMachine {
        let event = makeNextEvent(action)
        event.priority = Priority.Highest
        return this.addEvent(event)
    }

    /**
     * Starts the state timeout timer
     *
     * The timer for a state time-out is automatically cancelled when
     * the state machine changes states. You can restart a state
     * time-out by setting it to a new time, which cancels the
     * running timer and starts a new.
     *
     * @param time the timeout in ms
     * @return {this}
     */
    setStateTimeout(time: Timeout): StateMachine {
        this.log.i('setStateTimeout', time)

        let that = this
        this.timers
            .create(time, 'stateTimeout')
            .on('timer', () => that.addEvent(new StateTimeoutEvent({time})))
        return this
    }

    get hasStateTimer(): boolean {
        return this.hasTimer('stateTimeout')
    }

    get hasEventTimer(): boolean {
        return this.hasTimer('eventTimeout')
    }

    hasTimer(name: string): boolean {
        return !!this.timers.get(name)
    }

    /**
     * Starts the event timeout timer.
     *
     * If an event arrives before the timer fires, the timer
     * is cancelled. You get either an event or a time-out,
     * but not both.
     *
     * @param time the timeout
     * @return {this}
     */
    setEventTimeout(time: Timeout) {
        this.log.i('setEventTimeout', time)

        let that = this
        this.timers
            .create(time, 'eventTimeout')
            .on('timer', () =>
                that.addEvent(new EventTimeoutEvent({time})))
        return this
    }

    /**
     * Starts a generic timeout timer with an optional name.
     *
     * @param time the timeout in ms
     * @param name optional name. Defaults to "DEFAULT"
     * @return {this}
     */
    setGenericTimeout(time: Timeout, name = 'DEFAULT') {
        this.log.i('setEventTimeout', name, time)

        let that = this
        this.timers
            .create(time, name)
            .on('timer', () =>
                that.addEvent(new GenericTimeoutEvent({name, time})))
        return this
    }

    /**
     * Cancels the named timer
     *
     * @param name
     * @return {this}
     */
    cancelTimer(name: string): StateMachine {
        this.timers.cancel(name)
        return this
    }

    /**
     * Returns the current state after any already enqueued events are processed
     *
     * @return {Promise<any>}
     */
    async getState(): Promise<State> {
        return await this.call('getState')
    }

    /**
     * Returns the current data after any already enqueued events are processed
     *
     * @return {Promise<any>}
     */
    async getData() {
        return await this.call('getData')
    }
}
