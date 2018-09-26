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

import objectInspect = require("object-inspect")
import { ActionList } from "../action";
import { dataToString } from "../util/StringHelper"
import Result from "./Result";


export default abstract class ResultWithData<TData> extends Result {
    hasData = false

    /**
     * Optional state machine data
     */
    private _newData?: TData = undefined

    constructor(newData: TData, ...actions: ActionList) {
        super(...actions)
        this.newData = newData
    }

    get newData(): TData {
        if (!this._newData) {
            throw new Error("No data!")
        }
        return this._newData;
    }

    set newData(value: TData) {
        this.hasData = true
        this._newData = value;
    }

    get dataString(): string {
        return this.hasData ? dataToString(this.newData) : ""
    }

    toString(): string {
        return [this.type,
            objectInspect({
                actions: this.actions,
                data: this.newData,
            })].join(' ')
    }
}
