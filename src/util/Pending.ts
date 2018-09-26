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

import Logger from "../Logger"
import Deferred from './Deferred'
import { uniqId } from "./uniqId";

const Log = Logger("Pending");

export default class Pending {
    private pending: { [K in string]: Deferred<any> } = {}

    create(): string {
        const defer = new Deferred()
        const id: string = uniqId()
        Log.i(`created: ${id}`)
        this.pending[id] = defer
        return id
    }

    get(id: string): Promise<any> {
        return this.pending[id].promise
    }

    remove(id: string): void {
        delete this.pending[id]
    }

    resolve(id: string, x: any): void {
        Log.i(`resolve: ${id}`)
        this.pending[id].resolve(x)
    }

    reject(id: string, x: any): void {
        Log.i(`reject: ${id}`)
        this.pending[id].reject(x)
    }

    cleanup() {
        let completed = Object.entries(this.pending)
                              .filter(([id, defer]) => defer.completed)
        for (let [id] of completed) {
            this.remove(id)
        }
    }
}

