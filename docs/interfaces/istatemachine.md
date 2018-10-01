[gen-statem](../README.md) > [IStateMachine](../interfaces/istatemachine.md)

# Interface: IStateMachine

Public interface of a state machine.

## Type parameters
#### TData 
## Hierarchy

 [SMOptions](smoptions.md)<`TData`>

**↳ IStateMachine**

## Implemented by

* [StateMachine](../classes/statemachine.md)

## Index

### Properties

* [handlers](istatemachine.md#handlers)
* [hasEventTimer](istatemachine.md#haseventtimer)
* [hasStateTimer](istatemachine.md#hasstatetimer)
* [initialData](istatemachine.md#initialdata)
* [initialState](istatemachine.md#initialstate)

### Methods

* [addHandler](istatemachine.md#addhandler)
* [call](istatemachine.md#call)
* [cast](istatemachine.md#cast)
* [defaultEventHandler](istatemachine.md#defaulteventhandler)
* [getData](istatemachine.md#getdata)
* [getState](istatemachine.md#getstate)
* [hasTimer](istatemachine.md#hastimer)
* [startSM](istatemachine.md#startsm)
* [stopSM](istatemachine.md#stopsm)

---

## Properties

<a id="handlers"></a>

### `<Optional>` handlers

**● handlers**: *[Handlers](../#handlers)<`TData`>*

The state machine specification.

___
<a id="haseventtimer"></a>

###  hasEventTimer

**● hasEventTimer**: *`boolean`*

Returns true is an event timer is currently set
*__returns__*: 

___
<a id="hasstatetimer"></a>

###  hasStateTimer

**● hasStateTimer**: *`boolean`*

Returns true is state timer is currently set
*__returns__*: 

___
<a id="initialdata"></a>

### `<Optional>` initialData

**● initialData**: * `TData` &#124; `DataFn`<`TData`>
*

Initial data. optional.

___
<a id="initialstate"></a>

### `<Optional>` initialState

**● initialState**: *[State](../#state)*

State machine's initial state. Must be defined.

___

## Methods

<a id="addhandler"></a>

###  addHandler

▸ **addHandler**(routes: * `string` &#124; `Array`<`string`>*, handler: *[Handler](../#handler)<`TData`>*): [IStateMachine](istatemachine.md)<`TData`>

Adds a event handler for the given route.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| routes |  `string` &#124; `Array`<`string`>|  The routes for which the handler will be invoked. If multiple routes are specified, the handler will be invoked if any of routes match against an incoming event (boolean OR). |
| handler | [Handler](../#handler)<`TData`> |  the handler to invoke when a route is matched. |

**Returns:** [IStateMachine](istatemachine.md)<`TData`>

___
<a id="call"></a>

###  call

▸ **call**(request: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): `Promise`<`any`>

Fires a Call event and returns a promise that resolves or rejects when the state machine sends a reply (via a Reply(from)) handler action.

The state machine generates a unique string id for each invocation of `call` and provides it to the state machine as: "call/uniqueId#args#state"

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| request | [EventContext](../#eventcontext) |  the request context |
| `Optional` extra | [EventExtra](../#eventextra) |  extra |

**Returns:** `Promise`<`any`>

___
<a id="cast"></a>

###  cast

▸ **cast**(request: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): `void`

Sends an asynchronous request to the server. This function always returns regardless of whether the request was successful or handled by the StateMachine.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| request | [EventContext](../#eventcontext) |  request context |
| `Optional` extra | [EventExtra](../#eventextra) |   |

**Returns:** `void`

___
<a id="defaulteventhandler"></a>

###  defaultEventHandler

▸ **defaultEventHandler**(__namedParameters: *`object`*):  `Result` &#124; `undefined`

A catch-all handler invoked if no routes match an incoming event.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:**  `Result` &#124; `undefined`

___
<a id="getdata"></a>

###  getData

▸ **getData**(): `Promise`<`TData`>

Returns a promise that resolves with the current data. Sugar for `call('getData'). Handled by default handlers.

**Returns:** `Promise`<`TData`>

___
<a id="getstate"></a>

###  getState

▸ **getState**(): `Promise`<[State](../#state)>

Returns a promise that resolves with the current state. Sugar for `call('getState'). Handled by default handlers.

**Returns:** `Promise`<[State](../#state)>

___
<a id="hastimer"></a>

###  hasTimer

▸ **hasTimer**(name: *`string`*): `boolean`

Returns true if a timer with the given name is currently active

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string` |   |

**Returns:** `boolean`

___
<a id="startsm"></a>

###  startSM

▸ **startSM**(): [IStateMachine](istatemachine.md)<`TData`>

Starts the state machine

**Returns:** [IStateMachine](istatemachine.md)<`TData`>

___
<a id="stopsm"></a>

###  stopSM

▸ **stopSM**(reason: *`string`*, data?: *[TData]()*): `void`

Stops the state machine

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reason | `string` |  \-\- the reason for stopping |
| `Optional` data | [TData]() |  \-\- if set updates the machine's data before stopping |

**Returns:** `void`

___

