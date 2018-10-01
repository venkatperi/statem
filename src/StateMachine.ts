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


import EventEmitter = require("events")
import Route = require("route-parser")
import StablePriorityQueue = require("stablepriorityqueue")
import { Timer } from "ntimer"
import Action, {
    isEventTimeoutAction, isGenericTimeoutAction, isNextEventAction,
    isPostponeAction, isReplyAction, isStateTimeoutAction, NextEventAction
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
import { SMOptions } from "./SMOptions"
import { isStringState, State, stateRoute } from "./State";
import {
    EventContext, EventExtra, Handler, HandlerOpts, HandlerResult, Handlers,
    MatchedHandler, Priority, RouteHandlers, Timeout
} from "./types";
import './util/ArrayHelpers'
import Pending from "./util/Pending";
import Timers from "./util/Timers";

/**
 * @hidden
 */
const Log = Logger("StateMachine");

export class StateMachine<TData> extends EventEmitter
    implements IStateMachine<TData> {

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
        // Get the current state
        ["call/:from#getState#*_",
            ({args, current}) => reply(args.from, current)],

        // Get the current data
        ["call/:from#getData#*_",
            ({args, data}) => reply(args.from, data)],
    ];

    private _routeHandlers: RouteHandlers<TData> = [];

    private _pending = new Pending();

    private timers = new Timers();

    private processingEvent = false;

    private events = new StablePriorityQueue(Event.comparator);

    private postponedEvents: Array<Event> = []

    private _current = new Context<TData>()

    private _next = new Context<TData>()

    private _started: boolean = false

    private _stopped: boolean = false

    private isInitialState: boolean = true

    /**
     * Creates a StateMachine
     * @param init - initialization options
     */
    constructor(init?: SMOptions<TData>) {
        super();
        Object.assign(this, init)
    }

    /**
     *
     * @return {boolean}
     */
    protected get isRunning(): boolean {
        return this._started && !this._stopped
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

    /**
     * Gets the current data. Internal use only.
     *
     */
    private get data(): TData {
        return this._current.data;
    }

    /**
     * Sets the current {Data}. Internal only.
     * @param value the {Data}
     */
    private set data(value: TData) {
        this._next.data = value;
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

        this.addEvent(new CallEvent(from, request));
        let val = await this._pending.get(from);
        this.log.i(`call resolved`, request, from, val)
        return val
    }

    /**
     * @hidden
     *
     * @param request
     * @param extra
     */
    cast(request: EventContext, extra?: EventExtra): void {
        this.log.v(`cast`, request);
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
     * @return {Promise<any>}
     */
    getData(): Promise<TData> {
        return this.call<TData>("getData");
    }

    /**
     * @hidden
     * Returns the current state after any already enqueued events
     * are processed
     *
     * @return {Promise<any>}
     */
    getState(): Promise<State> {
        return this.call<State>("getState");
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
            .on('createTimer', (...args) => this.emit('createTimer', ...args))
            .on('cancelTimer', (...args) => this.emit('cancelTimer', ...args))

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

    protected doSetEventTimeout(time: Timeout) {
        this.log.i("setEventTimeout", time);

        let that = this;
        this.setTimer(time, "eventTimeout")
            .on("timer",
                () => that.addEvent(new EventTimeoutEvent({time}),
                    {internal: true}));
        return this;
    }

    /**
     * Starts a generic timeout timer with an optional name.
     *
     * @param time the timeout in ms
     * @param name optional name. Defaults to "DEFAULT"
     * @return {this}
     */
    protected setGenericTimeout(time: Timeout, name = "DEFAULT") {
        this._next.genericTimeout = [time, name]
    }

    protected doSetGenericTimeout(time: Timeout, name = "DEFAULT") {
        this.log.i("setEventTimeout", name, time);

        let that = this;
        this.setTimer(time, name)
            .on("timer", () =>
                that.addEvent(new GenericTimeoutEvent({name, time}),
                    {internal: true}));
        return this;
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
     * Handle the given event. Matches the event's route to the
     * @param event
     */
    protected handleEvent(event: Event): void {
        this.processingEvent = true;
        const h = this.getEventHandler(event);

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
        this.handleResult(result, event);
        this.switchContext(event)
        this.processingEvent = false;
    }

    /**
     * Process event handler result
     * @param r
     * @param event
     */
    protected handleResult(r: HandlerResult<TData>, event: Event): void {
        r = r || keepState()

        let res = isResultBuilder(r) ? r.getResult(this.data) : r

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
     *
     * @param action
     * @param event
     */
    protected handleAction(action: Action, event: Event): void {
        this.log.i(`handleAction`, action.toString());

        if (isReplyAction(action)) {
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
     * Cancels the named timer
     *
     * @param name
     * @return {this}
     */
    private cancelTimer(name: string): void {
        this.timers.cancel(name);
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

        if (stateChanged) {
            this.emit("stateChanged", current.state, prev.state, current.data,
                event);
        }

        this.emit("state", current.state, prev.state, current.data, event);

        // if (current.hasData) {
        //     this.emit('data', this.data, prev.data)
        // }

        this._next = new Context<TData>(this.state)
    }

    private doSetState(s: State, entered = false) {
        if (isStringState(s) && s.indexOf('/') > 0) {
            s = s.split('/')
        }

        this._next.state = s;
        this._next.enterState = entered
    }

    private sendPostponedEvents() {
        for (let e of this.postponedEvents) {
            this.addEvent(e)
        }
        this.postponedEvents = []
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

    private doSetStateTimeout(time: Timeout): void {
        this.log.i("setStateTimeout", time);

        let that = this;
        this.setTimer(time, "stateTimeout")
            .on("timer",
                () => that.addEvent(new StateTimeoutEvent({time}),
                    {internal: true}));
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
     * Process the next event on the event queue
     */
    private processEvents() {
        setImmediate(this.doProcessEvents.bind(this));
    }

    /**
     * Actually process events
     */
    // @ts-ignore
    private doProcessEvents() {
        if (!this.isRunning
            || this.events.isEmpty()
            || this.processingEvent) {
            return;
        }
        this.log.v("processEvents", this.events);

        let e = this.events.poll();
        if (e) {
            this.handleEvent(e);
        }
        this.processEvents();
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

        return this.defaultEventHandler(opts);
    }
}

