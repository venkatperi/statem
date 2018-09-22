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
import { nextState } from "..";
import Action, {
    EventTimeoutAction, GenericTimeoutAction, NextEventAction, ReplyAction,
    StateTimeoutAction
} from "./action";
import Event, {
    CallEvent, CastEvent, EnterEvent, EventTimeoutEvent, GenericTimeoutEvent,
    makeNextEvent, StateTimeoutEvent
} from "./event";
import { IStateMachine } from "./IStateMachine"
import Logger from "./Logger";
import Result, { NextState, NextStateWithData } from "./result";
import ResultBuilder, { reply } from "./result/builder";
import { SMOptions } from "./SMOptions"
import {
    isComplexState, State, stateEquals, stateName, stateRoute
} from "./State";
import {
    Data, EventContext, EventExtra, Handler, HandlerOpts, HandlerResult,
    Handlers, MatchedHandler, Priority, RouteHandlers, Timeout
} from "./types";
import './util/ArrayHelpers'
import Pending from "./util/Pending";
import Timers from "./util/Timers";

const Log = Logger("StateMachine");

export class StateMachine extends EventEmitter
    implements IStateMachine {

    initialState: State

    handlers: Handlers

    initialData: Data

    log = {
        "d": this.logger("d"),
        "e": this.logger("e"),
        "i": this.logger("i"),
        "v": this.logger("v"),
        "w": this.logger("w"),
    };

    /**
     * Built in handlers. Appended to the end.
     *
     * @type {Handlers}
     */
    protected defaultHandlers: Handlers = [
        // Get the current state
        ["call/:from#getState#*_",
            ({args, current}) => reply(args.from, current)],

        // Get the current data
        ["call/:from#getData#*_",
            ({args, data}) => reply(args.from, data)],
    ];

    private _routeHandlers: RouteHandlers = [];

    private _pending = new Pending();

    private timers = new Timers();

    private processingEvent = false;

    private events = new StablePriorityQueue(Event.comparator);

    private _started: boolean = false

    private _state: State;

    private _data: Data;

    /**
     * Creates a StateMachine
     * @param init
     */
    constructor(init?: Partial<SMOptions>) {
        super();
        Object.assign(this, init)
    }

    get hasStateTimer(): boolean {
        return this.hasTimer("stateTimeout");
    }


    get hasEventTimer(): boolean {
        return this.hasTimer("eventTimeout");
    }

    startSM() {
        if (this._started) {
            return
        }
        this.log.i("startSM");

        if (!this.initialState) {
            throw new Error("initialState must be set");
        }

        // set data before setting state to handle initial state
        this.data = this.initialData;
        let that = this;
        let timers = this.timers;
        this.on("state", (s, old) => that.addEvent(new EnterEvent({old})))
            .on("stateChanged", () => timers.cancel("stateTimeout"))
            .on("event", () => timers.cancel("eventTimeout"));

        this.initHandlers();
        this.state = this.initialState;
        this.emit("init");
        this._started = true
        return this;
    }

    stopSM(reason?: string, timeout?: number) {
        this.log.i(`stop: ${reason}`);
        this.emit("terminate", reason);
    }

    async call(request: EventContext,
        timeout: number = Infinity): Promise<any> {
        const from = this._pending.create();
        this.log.i(`call`, request, from);

        this.addEvent(new CallEvent(from, request));
        return await this._pending.get(from);
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
        handler: Handler): IStateMachine {
        this.log.v(`addHandler`, routes, handler);

        if (typeof routes === "string") {
            routes = [routes];
        }

        try {
            let mapped: Array<[string, Route]> = <Array<[string, Route]>> routes.map(
                (r) => [r, new Route(r)]);
            this._routeHandlers.push({"routes": mapped, handler});
        } catch (e) {
            Log.e(e, routes || "No route!");
            throw e;
        }
        return this;
    }

    defaultEventHandler({event, args, current, data}: HandlerOpts): Result | undefined {
        this.log.i("defaultHandler", event.toString(), args);
        return undefined;
        // return new KeepStateAndData();
    }

    /**
     * Gets the current state. Internal use only.
     * Use getState() to query state safely.
     *
     * @return {State}
     */
    private get state(): State {
        return this._state;
    }

    /**
     * Sets the current state. Internal use only.
     * @param s
     */
    private set state(s: State) {
        this.log.i("setState", s);
        let old = this._state || this.initialState;
        let oldName = stateName(old);
        this._state = s;
        let currentName = stateName(s);

        this.emit("state", s, old);

        if ((isComplexState(s) || isComplexState(old)) && oldName ===
            currentName) {
            this.emit("complexStateChanged", s, old);
        }

        if (!stateEquals(s, old)) {
            this.emit("stateChanged", s, old);
        }

    }

    /**
     * Gets the current data. Internal use only.
     *
     * @return {Data} the current data
     */
    private get data(): Data {
        return this._data;
    }

    /**
     * Sets the current {Data}. Internal only.
     * @param value the {Data}
     */
    private set data(value: Data) {
        this.log.i("setData", value);
        let old = this._data;
        this._data = value;
        this.emit("data", value, old);
    }

    /**
     * Add an event as the *next* event
     * @param action
     * @return {this}
     */
    addNextEvent(action: NextEventAction): StateMachine {
        let event = makeNextEvent(action);
        if (event) {
            event.priority = Priority.Highest;
            return this.addEvent(event);
        }
        return this;
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
        this.log.i("setStateTimeout", time);

        let that = this;
        this.timers
            .create(time, "stateTimeout")
            .on("timer", () => that.addEvent(new StateTimeoutEvent({time})));
        return this;
    }

    hasTimer(name: string): boolean {
        return !!this.timers.get(name);
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
        this.log.i("setEventTimeout", time);

        let that = this;
        this.timers
            .create(time, "eventTimeout")
            .on("timer", () =>
                that.addEvent(new EventTimeoutEvent({time})));
        return this;
    }

    /**
     * Starts a generic timeout timer with an optional name.
     *
     * @param time the timeout in ms
     * @param name optional name. Defaults to "DEFAULT"
     * @return {this}
     */
    setGenericTimeout(time: Timeout, name = "DEFAULT") {
        this.log.i("setEventTimeout", name, time);

        let that = this;
        this.timers
            .create(time, name)
            .on("timer", () =>
                that.addEvent(new GenericTimeoutEvent({name, time})));
        return this;
    }

    /**
     * Cancels the named timer
     *
     * @param name
     * @return {this}
     */
    cancelTimer(name: string): StateMachine {
        this.timers.cancel(name);
        return this;
    }

    /**
     * Returns the current state after any already enqueued events are processed
     *
     * @return {Promise<any>}
     */
    async getState(): Promise<State> {
        return await this.call("getState");
    }

    /**
     * Returns the current data after any already enqueued events are processed
     *
     * @return {Promise<any>}
     */
    async getData() {
        return await this.call("getData");
    }

    /**
     * Adds state to log tags
     * @param level
     * @return {(tag2: string, ...args: any[]) => void}
     */
    logger(level: string) {
        return (tag2: string, ...args: Array<any>) => {
            Log[level](`${tag2}@${stateRoute(this.state)}: `, ...args);
        };
    }

    /**
     * Add event to the queue. Emits the 'event' event
     *
     * @param event
     * @return {this}
     */
    protected addEvent(event: Event) {
        this.log.i("addEvent", event.toString());

        this.emit("event", event);
        this.events.add(event);
        this.doProcessEvents();
        return this;
    }

    /**
     * Initialize handlers,
     * Default handlers come last
     */
    protected initHandlers() {
        let that = this;
        this.handlers = this.handlers || [];
        let h = this.defaultHandlers.concat(this.handlers);
        h.forEach(([route, handler]) => that.addHandler(route, handler));
    }

    /**
     * Get route handler for given event
     * @param e
     * @return {MatchedHandler|undefined}
     */
    protected getRouteHandler(e: Event): MatchedHandler | undefined {
        const eventRoute = e.toRoute(this.state);
        this.log.i("getRouteHandler", String(e), eventRoute);

        for (let routeHandler of this._routeHandlers) {
            for (let route of routeHandler.routes) {
                let result = route[1].match(eventRoute)

                if (result) {
                    return {routeHandler, result, "route": route[0]}
                }
            }
        }
    }

    /**
     * Handle the given event. Matches the event's route to the
     * @param event
     */
    protected handleEvent(event: Event): void {
        this.processingEvent = true;
        const h = this.getRouteHandler(event);
        let handlerOpts: HandlerOpts = {
            "args": h ? h.result : {},
            "current": this.state,
            "data": this.data,
            event,
            "route": h ? h.route : ''
        }

        this.log.i("handleEvent", event.type,
            {"args": handlerOpts.args, "route": handlerOpts.route});

        let result = this.getHandlerResult(h, handlerOpts);
        this.handleResult(result);
        this.processingEvent = false;
        this.processEvents();
    }

    /**
     * Process event handler result
     * @param res -- result from event handler
     */
    protected handleResult(res: HandlerResult): void {
        if (!res) {
            return
        }
        if (res instanceof ResultBuilder) {
            res = res.getResult(this.data);
        }

        this.log.i(`handleResult`, res.toString());

        if (res instanceof NextState || res instanceof NextStateWithData) {
            this.state = res.nextState;
        }

        if (res.hasData) {
            this.data = res.newData;
        }

        res.actions.forEach(this.handleAction.bind(this));
    }

    /**
     *
     * @param action
     */
    protected handleAction(action: Action) {
        this.log.i(`handleAction`, action.toString());

        if (action instanceof ReplyAction) {
            this._pending.resolve(action.from, action.reply);
        }
        else if (action instanceof StateTimeoutAction) {
            this.setStateTimeout(action.time);
        }
        else if (action instanceof EventTimeoutAction) {
            this.setEventTimeout(action.time);
        }
        else if (action instanceof GenericTimeoutAction) {
            this.setGenericTimeout(action.time, action.name);
        }
        else if (action instanceof NextEventAction) {
            this.addNextEvent(action);
        }
        else {
            throw new Error(`No handler for action: ${action}`);
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
        if (this.events.isEmpty() || this.processingEvent) {
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
     * @param h
     * @return {any}
     * @param opts
     */
    private getHandlerResult(h: MatchedHandler | undefined,
        opts: HandlerOpts): HandlerResult {
        if (!h) {
            return this.defaultEventHandler(opts);
        }

        let handler: Handler = h.routeHandler.handler;
        if (typeof handler === "function") {
            return handler(opts);
        }

        if (Array.isArray(handler)) {
            return nextState(handler[0]).eventTimeout(handler[1]);
        }

        return nextState(handler);
    }
}

