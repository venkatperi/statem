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

import Result from './Result'
import {Data, State} from "../types";
import NextState from "./NextState";
import RepeatState from "./RepeatState";
import RepeatStateAndData from "./RepeatStateAndData";
import KeepState from "./KeepState";
import KeepStateAndData from "./KeepStateAndData";
import Stop from "./Stop";

export default Result

export type ResultList = Array<Result>

export namespace Results {
    export function nextState(nextState: State, newData?: Data, ...actions): NextState {
        return new NextState(nextState, newData, actions)
    }

    export function repeatState(newData?: Data, ...actions) {
        return new RepeatState(newData, actions)
    }

    export function repeatStateAndData(...actions) {
        return new RepeatStateAndData(actions)
    }

    export function keepState(newData?: Data, ...actions) {
        return new KeepState(newData, actions)
    }

    export function keepStateAndData(...actions) {
        return new KeepStateAndData(actions)
    }

    export function stop(nextState: State, newData?: Data, ...actions) {
        return new Stop(nextState, newData, actions)
    }
}
