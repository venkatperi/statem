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

const Emittery = require('emittery');
// import EventEmitter = require("events")
import  StablePriorityQueue = require("stablepriorityqueue")
import { Timer } from "ntimer"
import * as pTimeout from "p-timeout"
import * as Route from "route-parser"
import Action, {
    isEmitAction, isEventTimeoutAction, isGenericTimeoutAction,
    isNextEventAction, isPostponeAction, isReplyAction, isStateTimeoutAction,
    NextEventAction
} from "./action";
import { Context } from "./Context"
import Event, {
    CallEvent, CastEvent, EventTimeoutEvent, GenericTimeoutEvent, makeNextEvent,
    StateTimeoutEvent
} from "./event";
import EnterEvent from "./event/EnterEvent"
import { IStateMachine } from "./IStateMachine"
import Logger from "./Logger";
import Result, {
    isKeepStateResult, isNextStateResult, isRepeatStateResult, isResultBuilder,
    isResultWithData
} from "./result";
import { keepState, nextState, reply } from "./result/builder";
import { AnimOptions, SMOptions } from "./SMOptions"
import { isStringState, State, stateRoute } from "./State";
import {
    DataProxy, EventContext, EventExtra, Handler, HandlerOpts, HandlerResult,
    HandlerResult2, Handlers, MatchedHandler, Priority, RouteHandlers, Timeout
} from "./types";
import './util/ArrayHelpers'
import delay from "./util/delay"
import Pending from "./util/Pending";
import Timers from "./util/Timers";

/**
 * @hidden
 */
const Log = Logger("StateMachine");

/**
 * State Machine
 */
export class StateMachine<TData> implements IStateMachine<TData> {

    animation?: AnimOptions

    dataProxy?: DataProxy<TData>

    /**
     * @hidden
     */
    handlerTimeout?: number

    /**
     * @hidden
     * @type {undefined}
     */
    handlers?: Handlers<TData> = undefined

    /**
     *
     * @hidden
     * @type {undefined}
     */
    initialData?: TData = undefined

    /**
     * @hidden
     *
     * @type {undefined}
     */
    initialState?: State = undefined

    /**
     * @hidden
     */
    log = {
        d: this.logger("d"),
        e: this.logger("e"),
        i: this.logger("i"),
        v: this.logger("v"),
        w: this.logger("w"),
    };

    /**
     * Built in handlers. Appended to the end.
     *
     * @type {Handlers}
     */
    protected defaultHandlers: Handlers<TData> = [
        // Get the current state & data
        ["call/:from#getStateAndData#*_",
            ({args, current, data}) =>
                reply(args.from, [current, data])]
    ];

    private _current = new Context<TData>()

    private _emitter = new Emittery()

    private _next = new Context<TData>()

    private _pending = new Pending();

    private _routeHandlers: RouteHandlers<TData> = [];

    private _started: boolean = false

    private _stopped: boolean = false

    private events = new StablePriorityQueue(Event.comparator);

    private isInitialState: boolean = true

    private postponedEvents: Array<Event> = []

    private processingEvent = false;

    private timers = new Timers();

    /**
     * Creates a StateMachine
     * @param init - initialization options
     */
    constructor(init?: SMOptions<TData>) {
        // super();
        Object.assign(this, init)
        this.animation = this.animation || {}
    }

    /**
     *
     * @return {boolean}
     */
    protected get isRunning(): boolean {
        return this._started && !this._stopped
    }

    /**
     * Gets the current data. Internal use only.
     *
     */
    private get data(): TData {
        if (this.dataProxy) {
            return this.dataProxy.get()
        }
        return this._current.data;
    }

    /**
     * Sets the current {Data}. Internal only.
     * @param value the {Data}
     */
    private set data(value: TData) {
        this._next.data = Object.freeze(value);
    }

    /**
     * Gets the current state. Internal use only.
     * Use getState() to query state safely.
     *
     * @return {State}
     */
    private get state(): State {
        return this._current.state
    }

    /**
     * Sets the current state. Internal use only.
     * @param s
     */
    private set state(s: State) {
        this.doSetState(s)
    }

    private get usingDefaultHandler() {
        return this._current.usingDefaultHandler
    }

    private set usingDefaultHandler(v: boolean) {
        this._next.usingDefaultHandler = v
    }

    /**
     * @hidden
     * add an event handler
     *
     * @param routes
     * @param handler
     * @return {this<{TData}>}
     */
    addHandler(routes: string | Array<string>,
        handler: Handler<TData>): IStateMachine<TData> {

        if (this._started) {
            throw new Error("Can't add handler. Already running.")
        }

        this.log.v(`addHandler`, routes, handler);

        if (typeof routes === "string") {
            routes = [routes];
        }

        try {
            let mapped: Array<[string, Route]> = <Array<[string, Route]>> routes.map(
                r => [r, new Route(r)]);
            this._routeHandlers.push({routes: mapped, handler});
        } catch (e) {
            Log.e(e, routes || "No route!");
            throw e;
        }
        return this;
    }

    /**
     * @hidden
     * @param request
     * @param extra
     * @return {Promise<any>}
     */
    async call<E>(request: EventContext, extra?: EventExtra): Promise<E> {
        const from = this._pending.create();
        this.log.i(`call`, request, from);

        this.addEvent(new CallEvent(from, request, extra));
        return await this._pending.get(from)
    }

    /**
     * @hidden
     *
     * @param request
     * @param extra
     */
    cast(request: EventContext, extra?: EventExtra): void {
        this.log.i(`cast`, request);
        this.addEvent(new CastEvent(request, extra));
    }

    /**
     *
     * @hidden
     * @param event
     * @param args
     * @param current
     * @param data
     * @return {undefined}
     */
    defaultEventHandler({event, args, current, data}: HandlerOpts<TData>): Result | undefined {
        this.log.i("defaultHandler", event.toString(), args);
        return undefined
    }

    /**
     * @hidden
     * Returns the current data after any already enqueued events are
     * processed
     *
     * @return {Promise<[State , TData][1]>}
     */
    async getData(): Promise<TData> {
        return (await this.getStateAndData())[1];
    }

    /**
     * @hidden
     * Returns the current state after any already enqueued events
     * are processed
     *
     * @return {Promise<any>}
     */
    async getState(): Promise<State> {
        return (await this.getStateAndData())[0];
    }

    /**
     * @hidden
     * @return {Promise<[State , TData]>}
     */
    async getStateAndData(): Promise<[State, TData]> {
        return this.call<[State, TData]>("getStateAndData")
    }

    /**
     *
     * @hidden
     * @return {boolean}
     */
    get hasEventTimer(): boolean {
        return this.hasTimer("eventTimeout");
    }

    /**
     * @hidden
     *
     * @return {boolean}
     */
    get hasStateTimer(): boolean {
        return this.hasTimer("stateTimeout");
    }

    /**
     *
     * @hidden
     * @param name
     * @return {boolean}
     */
    hasTimer(name: string): boolean {
        return !!this.timers.get(name);
    }

    /**
     * @hidden
     * Starts the state machine
     * @return {this<TData>}
     */
    startSM(): IStateMachine<TData> {
        if (this._started) {
            return this
        }

        this.log.i("startSM");

        this.timers
            .on('createTimer', (...args) => this.emit('createTimer', args))
            .on('cancelTimer', (...args) => this.emit('cancelTimer', args))

        if (!this.initialState) {
            throw new Error("Initial state must be defined")
        }

        if (this.initialData) {
            this.data =
                typeof this.initialData === 'function'
                ? this.initialData()
                : this.initialData
        }

        this.initHandlers();

        this._started = true
        this.state = this.initialState;
        this.switchContext()
        this.emit("init");
        this.processEvents()
        return this
    }

    /**
     * @hidden
     * stop the state machine
     *
     * @param reason
     * @param data
     */
    stopSM(reason?: string, data?: TData) {
        if (!this.isRunning) {
            throw new Error("Can't stop. Illegal state.")
        }

        this.log.i(`stop: ${reason}`);
        this._stopped = true
        this.emit("terminate", reason);
    }

    /**
     * Trigger an event asynchronously, optionally with some data. Listeners
     * are called in the order they were added, but execute concurrently.
     *
     * Returns a promise for when all the event listeners are done. Done
     * meaning executed if synchronous or resolved when an
     * async/promise-returning function. You usually wouldn't want to wait for
     * this, but you could for example catch possible errors. If any of the
     * listeners throw/reject, the returned promise will be rejected with the
     * error, but the other listeners will not be affected.
     *
     * @param name
     * @param args
     * @return {Promise<void>}
     */
    emit(name: string, ...args: Array<any>): Promise<void> {
        return this._emitter.emit(name, args)
    }

    /**
     * Subscribe to an event.
     * @param name
     * @param cb
     * @return {this<TData>}
     */
    on(name: string, cb: (...args: Array<any>) => void): this {
        this._emitter.on(name, (a: any) => {
            if (Array.isArray(a)) {
                return cb(...a)
            }
            cb(a)
        })
        return this
    }

    /**
     *
     * @param time
     * @return {any}
     */
    protected doSetEventTimeout(time: Timeout) {
        this.log.i("setEventTimeout", time);

        if (time < 0) {
            return this.cancelTimer('eventTimeout')
        }

        let that = this;
        this.setTimer(time, "eventTimeout")
            .on("timer",
                () => that.addEvent(new EventTimeoutEvent({time}),
                    {internal: true}));
        return this;
    }

    /**
     *
     * @param time
     * @param name
     * @return {any}
     */
    protected doSetGenericTimeout(time: Timeout, name = "DEFAULT"): void {
        this.log.i("setEventTimeout", name, time);

        if (time < 0) {
            return this.cancelTimer(name)
        }

        let that = this;
        this.setTimer(time, name)
            .on("timer", () =>
                that.addEvent(new GenericTimeoutEvent({name, time}),
                    {internal: true}));
    }

    /**
     * Get route handler for given event
     * @param e
     * @return {MatchedHandler|undefined}
     */
    protected getEventHandler(e: Event): MatchedHandler<TData> | undefined {
        const eventRoute = e.toRoute(this.state);
        this.log.i("getEventHandler", String(e), eventRoute);

        for (let routeHandler of this._routeHandlers) {
            for (let route of routeHandler.routes) {
                let result = route[1].match(eventRoute)

                if (result) {
                    return {
                        result,
                        route: route[0],
                        routeHandler: routeHandler.handler,
                    }
                }
            }
        }
        return undefined
    }

    /**
     *
     * @param action
     * @param event
     */
    protected handleAction(action: Action, event: Event): void {
        this.log.i(`handleAction`, action.toString());

        if (isEmitAction(action)) {
            this._next.emit.push([action.name, action.args])
        }
        else if (isReplyAction(action)) {
            this._next.replies.push([action.from, action.reply])
        }
        else if (isStateTimeoutAction(action)) {
            this.setStateTimeout(action.time);
        }
        else if (isEventTimeoutAction(action)) {
            this.setEventTimeout(action.time);
        }
        else if (isGenericTimeoutAction(action)) {
            this.setGenericTimeout(action.time, action.name);
        }
        else if (isNextEventAction(action)) {
            this.addNextEvent(action);
        }
        else if (isPostponeAction(action)) {
            event.priority -= 20 // boost priority to ensure this is queued
            // first
            this.postponedEvents.push(event)
            this.log.i('postponed', this.postponedEvents)
        }
        else {
            throw new Error(`No handler for action: ${action}`);
        }
    }

    /**
     * Handle the given event. Matches the event's route to the
     * @param event
     * @return {Promise<void>}
     */
    protected async handleEvent(event: Event) {
        this.processingEvent = true;
        const h = this.getEventHandler(event);

        this.emit('currentEvent', event)

        let handlerOpts: HandlerOpts<TData> = {
            args: h ? h.result : {},
            current: this.state,
            data: this.data,
            event,
            route: h ? h.route : ''
        }

        this.log.i("handleEvent", event.type,
            {args: handlerOpts.args, route: handlerOpts.route});

        let result = this.invokeHandler(h && h.routeHandler, handlerOpts)
        let res = this.handleResult(result, event);
        res = this.handlerTimeout ? pTimeout(res, this.handlerTimeout) : res
        await res
        this.switchContext(event)
        if (this.animation && this.animation.delay &&
            (this.animation.includeDefault || !this.usingDefaultHandler)) {
            await delay(this.animation.delay)
        }

        this.processingEvent = false;
    }

    /**
     * Process event handler result
     * @param r
     * @param event
     * @return {Promise<void>}
     */
    protected async handleResult(r: HandlerResult2<TData>, event: Event) {
        r = (await r) || keepState()

        const res: Result = isResultBuilder(r) ? r.getResult(this.data) : r

        this.log.i(`handleResult`, res);

        for (let a of res.actions) {
            this.handleAction(a, event)
        }

        if (isNextStateResult(res)) {
            this.state = res.nextState;
        }
        else if (isKeepStateResult(res)) {
            this.state = this.state
        }
        else if (isRepeatStateResult(res)) {
            this.doSetState(this.state, true)
        }

        if (isResultWithData<TData>(res) && res.hasData) {
            this.data = res.newData
        }
        else {
            this.data = this.data
        }
    }

    /**
     * Initialize handlers,
     * Default handlers come last
     */
    protected initHandlers(): void {
        let handlers = this.defaultHandlers.concat(this.handlers || []);

        for (let h of handlers) {
            if (Array.isArray(h)) {
                this.addHandler(h[0], h[1])
            } else {
                for (let [k, v] of Object.entries(h)) {
                    this.addHandler(k, v)
                }
            }
        }
    }

    /**
     * @hidden
     * Adds state to log tags
     * @param level
     * @return {(tag2: string, ...args: any[]) => void}
     */
    protected logger(level: string) {
        return (tag2: string, ...args: Array<any>) => {
            Log[level](`${tag2}@${stateRoute(this.state)}: `, ...args);
        };
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
    protected setEventTimeout(time: Timeout) {
        this._next.eventTimeout = time
    }

    /**
     * Starts a generic timeout timer with an optional name.
     *
     * @param time the timeout in ms
     * @param name optional name. Defaults to "DEFAULT"
     */
    protected setGenericTimeout(time: Timeout, name = "DEFAULT"): void {
        this._next.genericTimeout = [time, name]
    }

    /**
     * Add event to the queue. Emits the 'event' event
     *
     * @param event
     * @return {this}
     * @param internal - if true, event was internally generated
     * @param noProcess
     */
    private addEvent(event: Event,
        {noProcess, internal}: { noProcess?: boolean, internal?: boolean } = {}): void {
        if (!this.isRunning) {
            throw new Error("Can't add event. Not running.")
        }

        this.log.i("addEvent", event.toString(), internal, noProcess);

        if (!internal) {
            this.cancelTimer('eventTimeout')
        }

        this.events.add(event);
        this.emit("event", event);

        if (!noProcess) {
            this.processEvents();
        }
    }

    /**
     * Add an event as the *next* event
     * @param action
     */
    private addNextEvent(action: NextEventAction): void {
        let event = makeNextEvent(action);
        if (event) {
            event.priority = Priority.Highest;
            this._next.nextEvents.push(event)
        }
    }

    /**
     * Cancels the named timer
     *
     * @param name
     * @return {this}
     */
    private cancelTimer(name: string): void {
        this.timers.cancel(name);
    }

    /**
     * Actually process events
     */
    private doProcessEvents() {
        if (!this.isRunning
            || this.events.isEmpty()
            || this.processingEvent) {
            return;
        }
        this.log.v("processEvents", this.events);

        let e = this.events.poll();
        if (e) {
            this.handleEvent(e)
                .then(() => this.processEvents())
                .catch((...args) => this.emit('error', ...args))
        }
    }

    /**
     *
     * @param s
     * @param entered
     */
    private doSetState(s: State, entered = false) {
        if (isStringState(s) && s.indexOf('/') > 0) {
            s = s.split('/')
        }

        this._next.state = s;
        this._next.enterState = entered
    }

    /**
     *
     * @param time
     */
    private doSetStateTimeout(time: Timeout): void {
        this.log.i("setStateTimeout", time);
        if (time < 0) {
            return this.cancelTimer('stateTimeout')
        }

        let that = this;
        this.setTimer(time, "stateTimeout")
            .on("timer",
                () => that.addEvent(new StateTimeoutEvent({time}),
                    {internal: true}));
    }

    /**
     * Executes handler and returns result
     * @param opts
     * @param handler
     * @return {any}
     */
    private invokeHandler(handler: Handler<TData> | undefined,
        opts: HandlerOpts<TData>): HandlerResult<TData> {
        this.log.i('invokeHandler', handler, opts)

        if (typeof handler === "function") {
            return handler.call(this, opts);
        }

        if (typeof handler === 'string') {
            return nextState(handler)
        }

        if (Array.isArray(handler)) {
            return nextState(handler[0]).eventTimeout(handler[1]);
        }

        this.usingDefaultHandler = true
        return this.defaultEventHandler(opts);
    }

    /**
     * Process the next event on the event queue
     */
    private processEvents() {
        setImmediate(this.doProcessEvents.bind(this));
    }

    /**
     *
     */
    private sendPostponedEvents() {
        for (let e of this.postponedEvents) {
            this.addEvent(e)
        }
        this.postponedEvents = []
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
     */
    private setStateTimeout(time: Timeout): void {
        this._next.stateTimeout = time
    }

    /**
     * Sets a named timer
     * @param name
     * @param time
     * @return {Timer}
     */
    private setTimer(time: Timeout, name: string): Timer {
        return this.timers.create(time, name)
    }

    /**
     *
     * @param event
     */
    private switchContext(event?: Event) {
        this.log.i('switchContext')

        const prev = this.isInitialState ? this._next : this._current
        const current = this._current = this._next
        const stateChanged = this.isInitialState
            || current.enterState
            || !current.stateEq(prev)

        this.isInitialState = false

        if (stateChanged) {
            this.cancelTimer('stateTimeout')
        }

        for (let reply of current.replies) {
            this._pending.resolve(...reply)
        }

        for (let event of current.nextEvents) {
            this.addEvent(event, {noProcess: true, internal: true})
        }

        if (stateChanged) {
            this.addEvent(new EnterEvent({old: prev.stateName}),
                {internal: true, noProcess: true})
            this.sendPostponedEvents()
        }

        if (current.stateTimeout) {
            this.doSetStateTimeout(current.stateTimeout)
        }

        if (current.eventTimeout) {
            this.doSetEventTimeout(current.eventTimeout)
        }

        if (current.genericTimeout) {
            this.doSetGenericTimeout(...current.genericTimeout)
        }

        const args: Array<any> = [current.state, prev.state,
            current.data, event]

        let events: Array<[string, Array<any>]> = this._next.emit
        events.unshift(['state', args])
        if (stateChanged) {
            events.unshift(['stateChanged', args])
        }

        if (this.dataProxy) {
            this.dataProxy.set(current.data, current.state)
        }

        this._next = new Context<TData>(this.state)

        for (let e of events) {
            this.emit(e[0], ...e[1])
        }
    }
}

