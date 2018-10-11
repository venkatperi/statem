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


import Event from "./event/Event"
import { isComplexState, State, stateEquals, stateName } from "./State"
import { From, Timeout } from "./types"

/**
 * @hidden
 * State machine context, between states.
 */
export class Context<TData> {

    emit: Array<[string, Array<any>]> = []

    enterState = false

    eventTimeout?: Timeout

    genericTimeout?: [Timeout, string]

    hasData = false

    hasState = false

    nextEvents: Array<Event> = []

    replies: Array<[From, any]> = []

    stateTimeout?: Timeout

    usingDefaultHandler = false

    // @ts-ignore
    private _data: TData

    // @ts-ignore
    private _state: State

    constructor(state?: State) {
        if (state) {
            this._state = state
        }
    }

    get data(): TData {
        return this._data
    }

    set data(value: TData) {
        this._data = value
        this.hasData = true
    }

    get isComplexState(): boolean {
        return isComplexState(this.state)
    }

    get state(): State {
        return this._state
    }

    set state(value: State) {
        this._state = value
        this.hasState = true
    }

    get stateName(): string {
        return stateName(this.state)
    }

    stateEq(other?: Context<TData>): boolean {
        return other ? stateEquals(this.state, other.state) : false
    }
}
