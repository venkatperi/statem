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

import StateMachine, {Handlers, keepState, nextState, State, Timeout} from '../..';
import Deferred from "../../src/util/Deferred";
import {stateName} from "../../src/types";

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

    initialData = {
        running: new Deferred(),
        terminated: new Deferred(),
        errors: []
    }

    handlers: Handlers = [
        ['cast#start#new', () => this.doNext('starting')],

        [['cast#stop#new',
            'cast#done#stopping',
            'cast#done#cancelling'], 'terminated'],

        ['cast#done#starting', 'running'],

        ['cast#stop#starting', () => this.doNext('cancelling')],
        ['cast#stop#running', () => this.doNext('stopping')],

        ['enter#*_#starting', () => this.onStarting()],
        ['enter#*_#running', ({data}) => data.running.resolve()],
        ['enter#*_#stopping', () => this.onStopping()],
        ['enter#*_#cancelling', () => this.onCancelling()],
        ['enter#*_#terminated', ({data}) => data.terminated.resolve()],
        ['enter#*_#failed', ({data}) => data.terminated.reject(data.errors)],

        ['cast#error#*_', ({event}) => nextState('failed').data({
            errors: {$push: [event.extra.reason]}
        })],

        ['stateTimeout#*_#*_', ({current}) => keepState().nextEvent('cast', 'error',
            {reason: new Error(`Timeout waiting for state change in state: ${current}`)})],
    ]

    /**
     * Constructor
     */
    constructor() {
        super()
        this.startSM()
    }

    /**
     * Returns true if this service is running.
     * @return {boolean}
     */
    async isRunning() {
        return await this.getState() === 'running'
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
        let state = await this.getState()
        if (['cancelling', 'stopping', 'terminated', 'failed']
            .indexOf(stateName(state)) >= 0) {
            throw new Error(`Can't enter 'running' from state: ${state}`)
        }
        let data = await this.getData()
        await data.running
    }

    /**
     * Waits for the Service to reach the terminated state.
     *
     * Rejects if the service fails.
     * @return {Promise<void>}
     */
    async awaitTerminated() {
        let data = await this.getData()
        await data.terminated
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
     * Dispatch result (cast -- done or error)
     * @param p
     */
    private dispatch(p: Promise<void>) {
        p.then(() => this.done()).catch((e) => this.error(e))
    }

    private onStarting() {
        this.dispatch(this.doStart())
    }

    private onStopping() {
        this.dispatch(this.doStop())
    }

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

}
