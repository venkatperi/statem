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

import StateMachine, {Event, Handlers, nextState, State, Timeout} from '../..';
import Deferred from "../../src/util/Deferred";

export default class Service extends StateMachine {
    /**
     * Initial state
     * @type {string}
     */
    initialState = 'new'

    /**
     * Timeout for completing service start|stop
     *
     * @type {number|string} optional
     */
    timeout?: Timeout

    /**
     * List of errors
     * @type {Error[]}
     */
    errors = []

    private running = new Deferred()

    private terminated = new Deferred()

    handlers: Handlers = [
        ['cast#start#new', () => this.doNext('starting')],
        ['cast#stop#new', 'terminated'],

        ['enter#*_#starting', () => this.onStarting()],
        ['cast#done#starting', 'running'],
        ['cast#stop#starting', () => this.doNext('cancelling')],
        ['cast#error#starting', ({event}) => this.onError(event)],

        ['enter#*_#running', () => this.running.resolve()],
        ['cast#stop#running', () => this.doNext('stopping')],

        ['enter#*_#stopping', () => this.onStopping()],
        ['cast#done#stopping', 'terminated'],
        ['cast#error#stopping', ({event}) => this.onError(event)],

        ['enter#*_#cancelling', () => this.onCancelling()],
        ['cast#done#cancelling', 'terminated'],
        ['cast#error#cancelling', ({event}) => this.onError(event)],

        ['enter#*_#terminated', () => this.terminated.resolve()],
        ['enter#*_#failed', () => this.terminated.reject(this.errors)],

        ['stateTimeout#*_#:state', ({current}) => {
            this.errors.push(new Error(`Timeout waiting for state change in state: ${current}`))
            return nextState('failed')
        }],
    ]

    constructor() {
        super()
        this.startSM()
    }

    /**
     * Returns true if this service is running.
     * @return {boolean}
     */
    get isRunning(): boolean {
        return this.state === 'running'
    }

    /**
     * Initiates service startup and returns immediately.
     * @return {Promise<void>}
     */
    async start() {
        if (await this.getState() !== 'new')
            throw new Error('Service is not in state new')
        this.cast('start')
    }

    /**
     * Initiates service shutdown and returns immediately.
     */
    stop() {
        this.cast('stop')
    }

    /**
     * Waits for the Service to reach the running state.
     * If the service reaches a state from which it is not possible to
     * enter the running state. e.g. if the state is terminated when this method
     * is called then this will throw an exception.
     *
     * @return {Promise<void>}
     */
    async awaitRunning() {
        if (this.running.completed) {
            if (this.state === 'running') return
            throw new Error(`awaitRunning() called from illegal state ${this.state}`)
        }
        await this.running
    }

    /**
     * Waits for the Service to reach the terminated state.
     *
     * Rejects if the service fails.
     * @return {Promise<void>}
     */
    async awaitTerminated() {
        await this.terminated
    }

    /**
     * Called to initiate service startup.
     *
     * @return {Promise<void>}
     */
    async doStart() {
    }

    /**
     * Called to initiate service shutdown.
     *
     * @return {Promise<void>}
     */
    async doStop() {
    }

    /**
     * Called to initiate shutdown if the service is stopped before it
     * has fully started.
     *
     * @return {Promise<void>}
     */
    async doCancel() {
    }

    /**
     * Fire a 'done' event
     */
    private done() {
        this.cast('done')
    }

    /**
     * Fire error event with the given reason
     *
     * @param reason the failure reason
     */
    private error(reason: any) {
        this.cast('error', {reason})
    }

    /**
     * Add the event's error to the list of errors
     *
     * @param event
     */
    private addEventError(event: Event) {
        if (event.extra && event.extra.reason) {
            this.errors.push(event.extra.reason)
        }
    }

    /**
     * Dispatch result (cast -- done or error)
     * @param p
     */
    private dispatch(p: Promise<void>) {
        p.then(() => this.done()).catch((e) => this.error(e))
    }

    /**
     *
     */
    private onStarting() {
        this.dispatch(this.doStart())
    }

    /**
     *
     */
    private onStopping() {
        this.dispatch(this.doStop())
    }

    /**
     *
     */
    private onCancelling() {
        this.dispatch(this.doCancel())
    }

    /**
     * Transitions to the given event with optional stateTimeout action
     * @param next
     * @return {ResultBuilder}
     */
    private doNext(next: State) {
        let res = nextState(next)
        return !this.timeout ? res : res.stateTimeout(this.timeout);
    }

    /**
     * Stores the event's error (if any) and transitions to 'failed' state
     *
     * @param event
     * @return {ResultBuilder}
     */
    private onError(event: Event) {
        this.addEventError(event)
        return nextState('failed')
    }
}
