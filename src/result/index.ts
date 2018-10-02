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

import { HandlerResult } from "../types"
import ResultBuilder from "./builder/ResultBuilder"
import KeepState from "./KeepState";
import KeepStateAndData from "./KeepStateAndData";
import NextState from "./NextState";
import NextStateWithData from "./NextStateWithData";
import RepeatState from "./RepeatState";
import RepeatStateAndData from "./RepeatStateAndData";
import Result from "./Result"
import ResultWithData from "./ResultWithData";
import Stop from "./Stop";


export default Result

export {
    NextState, NextStateWithData, RepeatState, RepeatStateAndData,
    KeepState, KeepStateAndData, Stop, ResultWithData
}

/**
 * @hidden
 * @param r
 * @return {r is ResultBuilder}
 */
export function isResultBuilder(r: any): r is ResultBuilder {
    return r.getResult !== undefined
}

/**
 *
 * @hidden
 * @param r
 * @return {boolean}
 */
export function isNextStateResult(r: Result): r is NextState {
    return r.type === 'nextState' || r.type === 'nextStateWithData'
}

export function isPromiseResult<TData>(r: any): r is Promise<HandlerResult<TData>> {
    return r.then !== undefined
}

/**
 * @hidden
 *
 * @param r
 * @return {boolean}
 */
export function isKeepStateResult<TData>(r: Result): r is KeepState<TData> {
    return r.type === 'keepState' || r.type === 'keepStateAndData'
}

/**
 *
 * @hidden
 * @param r
 * @return {boolean}
 */
export function isRepeatStateResult<TData>(r: Result): r is RepeatState<TData> {
    return r.type === 'repeatState' || r.type === 'repeatStateAndData'
}

/**
 *
 * @hidden
 * @param r
 * @return {boolean}
 */
export function isResultWithData<TData>(r: any): r is ResultWithData<TData> {
    return r.hasData !== undefined
}

