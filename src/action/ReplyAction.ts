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

import { ActionType, From } from "../types";
import Action from "./Action";


/**
 * Replies to the caller (from) with the given message.
 */
export default class ReplyAction extends Action {
    /**
     * Creates a Reply action
     * @param from
     * @param reply
     */
    constructor(public from: From, public reply: any) {
        super()
    }

    /**
     * @hidden
     * @return {string}
     */
    get replyString(): string {
        if (typeof this.reply === "object") {
            return JSON.stringify(this.reply)
        }

        switch (this.reply) {
            case undefined:
            case null:
                return ""

            default:
                return String(this.reply)
        }
    }

    /**
     * @hidden
     * @return {string}
     */
    toString(): string {
        return `${super.toString()}, from=${this.from}, reply=${this.replyString}`
    }

    /**
     * @hidden
     * @type {"reply"}
     */
    type: ActionType = "reply"
}
