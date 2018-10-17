[gen-statem](../README.md) > [StateMachine](../classes/statemachine.md)

# Class: StateMachine

State Machine

## Type parameters
#### TData 
## Hierarchy

**StateMachine**

## Implements

* [IStateMachine](../interfaces/istatemachine.md)<`TData`>

## Index

### Constructors

* [constructor](statemachine.md#constructor)

### Properties

* [animation](statemachine.md#animation)
* [dataProxy](statemachine.md#dataproxy)

### Methods

* [emit](statemachine.md#emit)
* [on](statemachine.md#on)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new StateMachine**(init?: *[SMOptions](../interfaces/smoptions.md)<`TData`>*): [StateMachine](statemachine.md)

Creates a StateMachine

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` init | [SMOptions](../interfaces/smoptions.md)<`TData`> |  initialization options |

**Returns:** [StateMachine](statemachine.md)

___

## Properties

<a id="animation"></a>

### `<Optional>` animation

**● animation**: *[AnimOptions](../#animoptions)*

___
<a id="dataproxy"></a>

### `<Optional>` dataProxy

**● dataProxy**: *[DataProxy](../#dataproxy)<`TData`>*

___

## Methods

<a id="emit"></a>

###  emit

▸ **emit**(name: *`string`*, ...args: *`Array`<`any`>*): `Promise`<`void`>

Trigger an event asynchronously, optionally with some data. Listeners are called in the order they were added, but execute concurrently.

Returns a promise for when all the event listeners are done. Done meaning executed if synchronous or resolved when an async/promise-returning function. You usually wouldn't want to wait for this, but you could for example catch possible errors. If any of the listeners throw/reject, the returned promise will be rejected with the error, but the other listeners will not be affected.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string` |  - |
| `Rest` args | `Array`<`any`> |  - |

**Returns:** `Promise`<`void`>

___
<a id="on"></a>

###  on

▸ **on**(name: *`string`*, cb: *`function`*): `this`

Subscribe to an event.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string` |  - |
| cb | `function` |  - |

**Returns:** `this`

___

