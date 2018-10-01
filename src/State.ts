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


import { NamedPrimitiveObject } from "./types";
import { arrayEqual, objEqual } from "./util/arrayEqual";


/**
 * A complex state. If an object, must have a 'name' key which
 * specifies the base state name.
 */
export type ComplexState = Array<string> | NamedPrimitiveObject

/**
 * A State in the state machine.
 */
export type State = string | ComplexState

/**
 * @hidden
 * @param {State} s
 * @return {s is string}
 */
export function isStringState(s?: State): s is string {
    return typeof s === "string"
}

/**
 * @hidden
 * @param s
 * @return {boolean}
 */
export function isComplexState(s?: State): s is ComplexState {
    return typeof s !== "string"
}

/**
 * @hidden
 * @param s
 * @return {arg is Array<any>}
 */
export function isArrayState(s?: State): s is Array<string> {
    return Array.isArray(s)
}

/**
 * @hidden
 * @param s
 * @return {boolean}
 */
export function isObjState(s?: State): s is NamedPrimitiveObject {
    return typeof s === "object"
}

/**
 * @hidden
 * @param s
 * @return {string}
 */
export function stateName(s?: State) {
    if (!s) {
        return ''
    }
    if (typeof s === "string") {
        return s
    }
    if (Array.isArray(s)) {
        return s[0]
    }
    return s.name
}

/**
 * @hidden
 * @param a
 * @param b
 * @return {boolean}
 */
export function stateEquals(a?: State, b?: State): boolean {
    if (isStringState(a) && isStringState(b)) {
        return a === b
    }

    if (isArrayState(a) && isArrayState(b)) {
        return arrayEqual(a, b)
    }

    return isObjState(a) && isObjState(b) ? objEqual(a, b) : false
}

/**
 * @hidden
 * @param s
 * @return {string}
 */
export function stateRoute(s?: State): string {
    if (!s) {
        return "*"
    }

    if (isStringState(s)) {
        return String(s)
    }

    if (isArrayState(s)) {
        return s.join("/")
    }

    return s.name + "/" +
        Object.entries(s)
              .filter(([k]) => k !== "name")
              .map(x => x.join("/")).join("/")
}

