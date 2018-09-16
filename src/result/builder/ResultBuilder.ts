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

import Result from "../Result";
import {ActionList} from "../../action";
import {Data, From} from "../../types";
import StateTimeout from "../../action/StateTimeout";
import EventTimeout from "../../action/EventTimeout";
import GenericTimeout from "../../action/GenericTimeout";
import Reply from "../../action/Reply";


/**
 * Fluent builder for {Result}s
 */
export abstract class ResultBuilder {
    _hasNewData = false
    _newData?: Data
    _actions: ActionList = []

    /**
     * Builds the result
     */
    abstract get result(): Result

    /**
     * Use the given data for the result
     * @param newData {Data}
     * @return {this} for chaining
     */
    data(newData: Data): ResultBuilder {
        this._hasNewData = true
        this._newData = newData
        return this
    }

    /**
     * Adds the given actions to the result
     *
     * @param actions {ActionList} the actions
     * @return {this} for chaining
     */
    action(...actions: ActionList): ResultBuilder {
        this._actions = this._actions.concat(actions)
        return this
    }

    stateTimeout(time: number): ResultBuilder {
        return this.action(new StateTimeout(time))
    }

    eventTimeout(time: number): ResultBuilder {
        return this.action(new EventTimeout(time))
    }

    timeout(time: number): ResultBuilder {
        return this.action(new GenericTimeout(time))
    }

    /**
     * Adds a {Reply} action
     *
     * @param from - sends the reply here
     * @param msg - the message to send
     * @return {ResultBuilder}
     */
    reply(from: From, msg: any): ResultBuilder {
        return this.action(new Reply(from, msg))
    }
}

