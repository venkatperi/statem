
#  gen-statem

## Index

### Enumerations

* [Priority](enums/priority.md)

### Classes

* [CallEvent](classes/callevent.md)
* [CastEvent](classes/castevent.md)
* [EnterEvent](classes/enterevent.md)
* [EventTimeoutAction](classes/eventtimeoutaction.md)
* [EventTimeoutEvent](classes/eventtimeoutevent.md)
* [GenericTimeoutAction](classes/generictimeoutaction.md)
* [GenericTimeoutEvent](classes/generictimeoutevent.md)
* [InternalEvent](classes/internalevent.md)
* [KeepState](classes/keepstate.md)
* [KeepStateAndData](classes/keepstateanddata.md)
* [KeepStateBuilder](classes/keepstatebuilder.md)
* [NextEventAction](classes/nexteventaction.md)
* [NextState](classes/nextstate.md)
* [NextStateBuilder](classes/nextstatebuilder.md)
* [NextStateWithData](classes/nextstatewithdata.md)
* [RepeatState](classes/repeatstate.md)
* [RepeatStateAndData](classes/repeatstateanddata.md)
* [RepeatStateBuilder](classes/repeatstatebuilder.md)
* [ReplyAction](classes/replyaction.md)
* [ResultBuilder](classes/resultbuilder.md)
* [StateMachine](classes/statemachine.md)
* [StateTimeoutAction](classes/statetimeoutaction.md)
* [StateTimeoutEvent](classes/statetimeoutevent.md)
* [Stop](classes/stop.md)

### Interfaces

* [IStateMachine](interfaces/istatemachine.md)
* [SMOptions](interfaces/smoptions.md)

### Type aliases

* [ActionType](#actiontype)
* [ComplexState](#complexstate)
* [EventContext](#eventcontext)
* [EventExtra](#eventextra)
* [EventType](#eventtype)
* [From](#from)
* [Handler](#handler)
* [HandlerFn](#handlerfn)
* [HandlerOpts](#handleropts)
* [HandlerResult](#handlerresult)
* [HandlerRoute](#handlerroute)
* [HandlerSpec](#handlerspec)
* [Handlers](#handlers)
* [NamedPrimitiveObject](#namedprimitiveobject)
* [NextStateWithEventTimeout](#nextstatewitheventtimeout)
* [Primitive](#primitive)
* [PrimitiveObject](#primitiveobject)
* [ResultType](#resulttype)
* [State](#state)
* [Timeout](#timeout)

### Functions

* [data](#data)
* [eventTimeout](#eventtimeout)
* [internalEvent](#internalevent)
* [keepState](#keepstate)
* [nextEvent](#nextevent)
* [nextState](#nextstate)
* [repeatState](#repeatstate)
* [reply](#reply)
* [stateTimeout](#statetimeout)
* [timeout](#timeout)

---

## Type aliases

<a id="actiontype"></a>

###  ActionType

**Ƭ ActionType**: * "reply" &#124; "nextEvent" &#124; "postpone" &#124; "stateTimeout" &#124; "eventTimeout" &#124; "genericTimeout"
*

Transition actions

___
<a id="complexstate"></a>

###  ComplexState

**Ƭ ComplexState**: * `Array`<`string`> &#124; [NamedPrimitiveObject](#namedprimitiveobject)
*

A complex state. If an object, must have a 'name' key which specifies the base state name.

___
<a id="eventcontext"></a>

###  EventContext

**Ƭ EventContext**: * [Primitive](#primitive) &#124; [PrimitiveObject](#primitiveobject)
*

Events can accept simple arguments of type {Primitive}, or a {PrimitiveObject}

___
<a id="eventextra"></a>

###  EventExtra

**Ƭ EventExtra**: *`any`*

Non {Primitive|PrimitiveObject} arguments to events.

___
<a id="eventtype"></a>

###  EventType

**Ƭ EventType**: * "call" &#124; "cast" &#124; "enter" &#124; "eventTimeout" &#124; "stateTimeout" &#124; "genericTimeout" &#124; "internal"
*

State machine events

___
<a id="from"></a>

###  From

**Ƭ From**: *`string`*

The caller's address for a {CallEvent}

___
<a id="handler"></a>

###  Handler

**Ƭ Handler**: * [HandlerFn](#handlerfn)<`TData`> &#124; [State](#state) &#124; [NextStateWithEventTimeout](#nextstatewitheventtimeout)
*

Route handler. Can be a function, a state or a \[state, event timeout\] tuple

___
<a id="handlerfn"></a>

###  HandlerFn

**Ƭ HandlerFn**: *`function`*

Handler function

#### Type declaration
▸(opts: *[HandlerOpts](#handleropts)<`TData`>*): [HandlerResult](#handlerresult)<`TData`>

**Parameters:**

| Param | Type |
| ------ | ------ |
| opts | [HandlerOpts](#handleropts)<`TData`> |

**Returns:** [HandlerResult](#handlerresult)<`TData`>

___
<a id="handleropts"></a>

###  HandlerOpts

**Ƭ HandlerOpts**: *`object`*

Values passed to a {Handler}

#### Type declaration

 args: `object`

 current: [State](#state)

 data: `TData`

 event: `Event`

 route: `string`

___
<a id="handlerresult"></a>

###  HandlerResult

**Ƭ HandlerResult**: * `Result` &#124; `ResultWithData`<`TData`> &#124; [ResultBuilder](classes/resultbuilder.md) &#124; `void`
*

Result of a handler invocation. {ResultBuilder.getResult()} is invoked to convert a {ResultBuilder} to a {Result} {void} implies {KeepStateWithData}

___
<a id="handlerroute"></a>

###  HandlerRoute

**Ƭ HandlerRoute**: * `string` &#124; `Array`<`string`>
*

The key of a handler. Can be {string|Array}. If {Array}, the routes are treated as a boolean OR. Any matching route in the array will invoke the handler.

___
<a id="handlerspec"></a>

###  HandlerSpec

**Ƭ HandlerSpec**: * [[HandlerRoute](#handlerroute), [Handler](#handler)<`TData`>] &#124; `object`
*

A {HandlerRoute} to {Handler} entry. Can be a tuple or object with string keys. If an object, the keys are treated as {string} routes.

___
<a id="handlers"></a>

###  Handlers

**Ƭ Handlers**: *`Array`<[HandlerSpec](#handlerspec)<`TData`>>*

List of route handlers

___
<a id="namedprimitiveobject"></a>

###  NamedPrimitiveObject

**Ƭ NamedPrimitiveObject**: *`object`*

Like {PrimitiveObject}, but expects a key 'name'

#### Type declaration

[k: `string`]: [Primitive](#primitive)

 name: `string`

___
<a id="nextstatewitheventtimeout"></a>

###  NextStateWithEventTimeout

**Ƭ NextStateWithEventTimeout**: *[[State](#state), [Timeout](#timeout)]*

Handlers can be specified as a tuple of the next {State} and a {EventTimeout}

___
<a id="primitive"></a>

###  Primitive

**Ƭ Primitive**: * `number` &#124; `string` &#124; `boolean` &#124; `null` &#124; `undefined`
*

Our definition of primitives (doesn't include symbol)

___
<a id="primitiveobject"></a>

###  PrimitiveObject

**Ƭ PrimitiveObject**: *`object`*

Object with string keys and primitive values

#### Type declaration

___
<a id="resulttype"></a>

###  ResultType

**Ƭ ResultType**: * "none" &#124; "keepState" &#124; "keepStateAndData" &#124; "nextState" &#124; "nextStateWithData" &#124; "repeatState" &#124; "repeatStateAndData" &#124; "stop" &#124; "builder"
*

Hander results

___
<a id="state"></a>

###  State

**Ƭ State**: * `string` &#124; [ComplexState](#complexstate)
*

A State in the state machine.

___
<a id="timeout"></a>

###  Timeout

**Ƭ Timeout**: * `number` &#124; `string`
*

Timeout values. Milliseconds if {number}. For string values, see {NTimer}

___

## Functions

<a id="data"></a>

###  data

▸ **data**<`TData`>(spec: *`Spec`<`TData`>*): [ResultBuilder](classes/resultbuilder.md)

Helper to only mutate data

**Type parameters:**

#### TData 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| spec | `Spec`<`TData`> |  - |

**Returns:** [ResultBuilder](classes/resultbuilder.md)

___
<a id="eventtimeout"></a>

###  eventTimeout

▸ **eventTimeout**(time: *[Timeout](#timeout)*): [KeepStateBuilder](classes/keepstatebuilder.md)

Helper function to set the event timeout timer

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](#timeout) |  - |

**Returns:** [KeepStateBuilder](classes/keepstatebuilder.md)

___
<a id="internalevent"></a>

###  internalEvent

▸ **internalEvent**(context?: *[EventContext](#eventcontext)*, extra?: *[EventExtra](#eventextra)*): [KeepStateBuilder](classes/keepstatebuilder.md)

Helper function to insert an 'internal' event

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` context | [EventContext](#eventcontext) |  - |
| `Optional` extra | [EventExtra](#eventextra) |  - |

**Returns:** [KeepStateBuilder](classes/keepstatebuilder.md)

___
<a id="keepstate"></a>

###  keepState

▸ **keepState**(): [KeepStateBuilder](classes/keepstatebuilder.md)

Returns a [KeepStateBuilder](classes/keepstatebuilder.md)

**Returns:** [KeepStateBuilder](classes/keepstatebuilder.md)

___
<a id="nextevent"></a>

###  nextEvent

▸ **nextEvent**(type: *[EventType](#eventtype)*, context?: *[EventContext](#eventcontext)*, extra?: *[EventExtra](#eventextra)*): [KeepStateBuilder](classes/keepstatebuilder.md)

Helper function to insert a new event

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| type | [EventType](#eventtype) |  - |
| `Optional` context | [EventContext](#eventcontext) |  - |
| `Optional` extra | [EventExtra](#eventextra) |  - |

**Returns:** [KeepStateBuilder](classes/keepstatebuilder.md)

___
<a id="nextstate"></a>

###  nextState

▸ **nextState**(state: *[State](#state)*): [NextStateBuilder](classes/nextstatebuilder.md)

Returns a [NextStateBuilder](classes/nextstatebuilder.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| state | [State](#state) |  - |

**Returns:** [NextStateBuilder](classes/nextstatebuilder.md)

___
<a id="repeatstate"></a>

###  repeatState

▸ **repeatState**(): [RepeatStateBuilder](classes/repeatstatebuilder.md)

Returns a [RepeatStateBuilder](classes/repeatstatebuilder.md)

**Returns:** [RepeatStateBuilder](classes/repeatstatebuilder.md)

___
<a id="reply"></a>

###  reply

▸ **reply**(from: *`string`*, msg: *`any`*): [KeepStateBuilder](classes/keepstatebuilder.md)

Helper function to return a reply

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| from | `string` |  - |
| msg | `any` |  - |

**Returns:** [KeepStateBuilder](classes/keepstatebuilder.md)

___
<a id="statetimeout"></a>

###  stateTimeout

▸ **stateTimeout**(time: *[Timeout](#timeout)*): [KeepStateBuilder](classes/keepstatebuilder.md)

Helper function to set a state timeout (keeps state and data)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](#timeout) |  - |

**Returns:** [KeepStateBuilder](classes/keepstatebuilder.md)

___
<a id="timeout"></a>

###  timeout

▸ **timeout**(time: *[Timeout](#timeout)*): [KeepStateBuilder](classes/keepstatebuilder.md)

helper function to set a generic timer

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](#timeout) |  - |

**Returns:** [KeepStateBuilder](classes/keepstatebuilder.md)

___

