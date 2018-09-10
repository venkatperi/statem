// @flow
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

import * as assert from 'assert';
import Button from './fixtures/Button'

let button = null

describe( 'button', () => {

  before(() => {
    button = new Button()
    button.start()
  })

  it( 'initial count is 0', async () => {
    const count = await button.getCount()
    assert.equal(count, 0)
  } )

  it( 'initial state is OFF', async () => {
    const s = await button.getState()
    assert.equal(s, 'off')
  } )

  it( 'after flip, state is on', async () => {
    button.flip()
    const s = await button.getState()
    assert.equal(s, 'on')
  } )

  it( 'count is 1', async () => {
    const count = await button.getCount()
    assert.equal(count, 1)
  } )

  it( 'after flip, state is off', async () => {
    button.flip()
    const s = await button.getState()
    assert.equal(s, 'off')
  } )

  it( 'count is still 1', async () => {
    const count = await button.getCount()
    assert.equal(count, 1)
  } )

} )
