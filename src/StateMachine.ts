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
import Action, {
    isEventTimeoutAction, isGenericTimeoutAction, isNextEventAction,
    isReplyAction, isStateTimeoutAction, NextEventAction
} from "./action";
import Event, {
    CallEvent, CastEvent, EventTimeoutEvent, GenericTimeoutEvent, makeNextEvent,
    StateTimeoutEvent
} from "./event";
import EnterEvent from "./event/EnterEvent"
import { IStateMachine } from "./IStateMachine"
import Logger from "./Logger";
import Result, {
    isNextStateResult, isResultBuilder, isResultWithData
} from "./result";
import { nextState, reply } from "./result/builder";
import { SMOptions } from "./SMOptions"
import {
    isComplexState, isStringState, State, stateEquals, stateName, stateRoute
} from "./State";
import {
    EventContext, EventExtra, Handler, HandlerOpts, HandlerResult, Handlers,
    MatchedHandler, Priority, RouteHandlers, Timeout
} from "./types";
import './util/ArrayHelpers'
import Pending from "./util/Pending";
import Timers from "./util/Timers";

const Log = Logger("StateMachine");

export class StateMachine<TData> extends EventEmitter
    implements IStateMachine<TData> {

    initialState?: State = undefined

    handlers?: Handlers<TData> = undefined

    initialData?: TData = undefined

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

    private _started: boolean = false

    private _stopped: boolean = false

    // @ts-ignore
    private _state: State

    // @ts-ignore
    private _data: TData

    private _initial = true

    /**
     * Creates a StateMachine
     * @param init
     */
    constructor(init?: SMOptions<TData>) {
        super();
        Object.assign(this, init)
    }

    get hasStateTimer(): boolean {
        return this.hasTimer("stateTimeout");
    }

    get hasEventTimer(): boolean {
        return this.hasTimer("eventTimeout");
    }

    startSM(): IStateMachine<TData> {
        if (this._started) {
            return this
        }
        this.log.i("startSM");

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
        this.emit("init");
        return this
    }

    stopSM(reason?: string, data?: TData) {
        this.log.i(`stop: ${reason}`);
        this._stopped = true
        this.emit("terminate", reason);
    }

    async call<E>(request: EventContext, extra?: EventExtra): Promise<E> {
        const from = this._pending.create();
        this.log.i(`call`, request, from);

        this.addEvent(new CallEvent(from, request));
        let val = await this._pending.get(from);
        this.log.i(`call resolved`, request, from, val)
        return val
    }

    cast(request: EventContext, extra?: EventExtra): void {
        this.log.v(`cast`, request);
        try {
            this.addEvent(new CastEvent(request, extra));
        } catch (e) {
            // ignore error for cast
            Log.e(e);
        }
    }

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

    defaultEventHandler({event, args, current, data}: HandlerOpts<TData>): Result | undefined {
        this.log.i("defaultHandler", event.toString(), args);
        return undefined
    }

    /**
     * Returns the current state after any already enqueued events
     * are processed
     *
     * @return {Promise<any>}
     */
    getState(): Promise<State> {
        return this.call<State>("getState");
    }

    /**
     * Returns the current data after any already enqueued events are
     * processed
     *
     * @return {Promise<any>}
     */
    getData(): Promise<TData> {
        return this.call<TData>("getData");
    }

    /**
     * Cancels the named timer
     *
     * @param name
     * @return {this}
     */
    cancelTimer(name: string): void {
        this.timers.cancel(name);
    }

    /**
     *
     * @param name
     * @return {boolean}
     */
    hasTimer(name: string): boolean {
        return !!this.timers.get(name);
    }

    /**
     * Gets the current state. Internal use only.
     * Use getState() to query state safely.
     *
     * @return {State}
     */
    private get state(): State {
        if (!this._state) {
            throw Error("No state?")
        }
        return this._state;
    }

    /**
     * Sets the current state. Internal use only.
     * @param s
     */
    private set state(s: State) {
        if (isStringState(s) && s.indexOf('/') > 0) {
            s = s.split('/')
        }

        this.log.i("setState", s);
        const old = this._initial ? s : this._state
        const oldName = stateName(old);
        this._state = s;
        let currentName = stateName(s);

        this.emit("state", s, old);

        if ((isComplexState(s) || isComplexState(old)) &&
            oldName === currentName) {
            this.emit("complexStateChanged", s, old);
        }

        if (this._initial || !stateEquals(s, old)) {
            this.addEvent(new EnterEvent({old: oldName}), true)
            this.timers.cancel("stateTimeout")
            this.emit("stateChanged", s, old);
        }
        this._initial = false
    }

    /**
     * Gets the current data. Internal use only.
     *
     */
    private get data(): TData {
        return this._data;
    }

    /**
     * Sets the current {Data}. Internal only.
     * @param value the {Data}
     */
    private set data(value: TData) {
        this.log.i("setData", value);
        let old = this._data;
        this._data = value;
        this.emit("data", value, old);
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
        this.log.i("setEventTimeout", time);

        let that = this;
        this.timers
            .create(time, "eventTimeout")
            .on("timer",
                () => that.addEvent(new EventTimeoutEvent({time}), true));
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
        this.log.i("setEventTimeout", name, time);

        let that = this;
        this.timers
            .create(time, name)
            .on("timer", () =>
                that.addEvent(new GenericTimeoutEvent({name, time}), true));
        return this;
    }

    /**
     * Adds state to log tags
     * @param level
     * @return {(tag2: string, ...args: any[]) => void}
     */
    protected logger(level: string) {
        return (tag2: string, ...args: Array<any>) => {
            Log[level](`${tag2}@${stateRoute(this._state)}: `, ...args);
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
        // Object.freeze(this._routeHandlers)
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

        let result = this.invokeHandler(h && h.routeHandler, handlerOpts);
        this.handleResult(result);
        this.processingEvent = false;
        this.processEvents();
    }

    /**
     * Process event handler result
     * @param r
     */
    protected handleResult(r: HandlerResult<TData>): void {
        if (!r) {
            return
        }

        let res = isResultBuilder(r) ? r.getResult(this.data) : r

        this.log.i(`handleResult`, res);

        if (isNextStateResult(res)) {
            this.state = res.nextState;
        }
        // else if (res instanceof KeepState || res instanceof
        // KeepStateAndData) { this.state = this.state }

        if (isResultWithData<TData>(res) && res.hasData) {
            this.data = res.newData;
        }

        for (let a of res.actions) {
            this.handleAction(a)
        }
    }

    /**
     *
     * @param action
     */
    protected handleAction(action: Action): void {
        this.log.i(`handleAction`, action.toString());

        if (isReplyAction(action)) {
            this._pending.resolve(action.from, action.reply);
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
        else {
            throw new Error(`No handler for action: ${action}`);
        }
    }

    /**
     * Add event to the queue. Emits the 'event' event
     *
     * @param event
     * @return {this}
     * @param internal - if true, event was internally generated
     */
    private addEvent(event: Event, internal = false): void {
        if (!this._started || this._stopped) {
            throw new Error("Can't add event. Not running.")
        }

        this.log.i("addEvent", event.toString(), internal);

        if (!internal) {
            this.timers.cancel('eventTimeout')
        }

        this.emit("event", event);
        this.events.add(event);
        this.doProcessEvents();
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
        this.log.i("setStateTimeout", time);

        let that = this;
        this.timers
            .create(time, "stateTimeout")
            .on("timer",
                () => that.addEvent(new StateTimeoutEvent({time}), true));
    }

    /**
     * Add an event as the *next* event
     * @param action
     */
    private addNextEvent(action: NextEventAction): void {
        let event = makeNextEvent(action);
        if (event) {
            event.priority = Priority.Highest;
            this.addEvent(event, true);
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
    private doProcessEvents() {
        if (!this._started
            || this._stopped
            || this.events.isEmpty()
            || this.processingEvent) {
            return;
        }
        this.log.v("processEvents", this.events);

        let e = this.events.poll();
        if (e) {
            this.handleEvent(e);
        }
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
            return handler(opts);
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

