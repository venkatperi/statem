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


import {NamedPrimitiveObject} from "./types";
import {arrayEqual, objEqual} from "./util/arrayEqual";

export type ComplexState = string[] | NamedPrimitiveObject

export type State = string | ComplexState

export function isStringState(s: State): s is string {
    return typeof s === 'string'
}

export function isComplexState(s: State): s is ComplexState {
    return typeof s !== 'string'
}

export function isArrayState(s: State): s is string[] {
    return Array.isArray(s)
}

export function isObjState(s: State): s is NamedPrimitiveObject {
    return typeof s === 'object'
}

export function stateName(s: State) {
    if (typeof s === 'string')
        return s
    if (Array.isArray(s))
        return s[0]
    return s.name
}

export function stateEquals(a: State, b: State) {
    if (isStringState(a) && isStringState(b))
        return a === b

    if (isArrayState(a) && isArrayState(b))
        return arrayEqual(a, b)

    if (isObjState(a) && isObjState(b))
        return objEqual(a, b)

    return false
}

export function stateRoute(s?: State): string {
    if (!s)
        return '*'

    if (isStringState(s))
        return String(s)

    if (isArrayState(s))
        return s.join('/')

    return s.name + '/' +
        Object.entries(s)
            .filter(([k]) => k !== 'name')
            .map(x => x.join('/')).join('/')
}
