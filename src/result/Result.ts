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

import Action, {ActionList} from "../action";
import {Data, ResultType} from "../types";

/**
 * This class encapsulates the result of a call to a state handler
 */
export default class Result {
    /**
     * The result type
     */
    readonly type: ResultType;

    /**
     * Optional state machine data
     */
    private _newData?: Data;

    hasData = false

    /**
     * The list of actions for this state
     */
    actions: Array<Action>;

    /**
     * Creates a new result
     * @param actions the actions
     */
    constructor(...actions: ActionList) {
        this.actions = actions
    }

    get newData(): Data {
        return this._newData;
    }

    set newData(value: Data) {
        this.hasData = true
        this._newData = value;
    }

}

