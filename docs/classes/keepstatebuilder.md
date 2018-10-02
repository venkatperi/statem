[gen-statem](../README.md) > [KeepStateBuilder](../classes/keepstatebuilder.md)

# Class: KeepStateBuilder

A {ResultBuilder} with a {KeepState|KeepStateAndData} result

## Hierarchy

 [ResultBuilder](resultbuilder.md)

**↳ KeepStateBuilder**

## Index

### Methods

* [action](keepstatebuilder.md#action)
* [cancelEventTimeout](keepstatebuilder.md#canceleventtimeout)
* [cancelStateTimeout](keepstatebuilder.md#cancelstatetimeout)
* [cancelTimeout](keepstatebuilder.md#canceltimeout)
* [data](keepstatebuilder.md#data)
* [eventTimeout](keepstatebuilder.md#eventtimeout)
* [internalEvent](keepstatebuilder.md#internalevent)
* [nextEvent](keepstatebuilder.md#nextevent)
* [postpone](keepstatebuilder.md#postpone)
* [reply](keepstatebuilder.md#reply)
* [stateTimeout](keepstatebuilder.md#statetimeout)
* [timeout](keepstatebuilder.md#timeout)

---

## Methods

<a id="action"></a>

###  action

▸ **action**(...actions: *`ActionList`*): [ResultBuilder](resultbuilder.md)

Adds the given actions to the result

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Rest` actions | `ActionList` |  the actions |

**Returns:** [ResultBuilder](resultbuilder.md)
for chaining

___
<a id="canceleventtimeout"></a>

###  cancelEventTimeout

▸ **cancelEventTimeout**(): [ResultBuilder](resultbuilder.md)

**Returns:** [ResultBuilder](resultbuilder.md)

___
<a id="cancelstatetimeout"></a>

###  cancelStateTimeout

▸ **cancelStateTimeout**(): [ResultBuilder](resultbuilder.md)

**Returns:** [ResultBuilder](resultbuilder.md)

___
<a id="canceltimeout"></a>

###  cancelTimeout

▸ **cancelTimeout**(name?: * `undefined` &#124; `string`*): [ResultBuilder](resultbuilder.md)

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` name |  `undefined` &#124; `string`|

**Returns:** [ResultBuilder](resultbuilder.md)

___
<a id="data"></a>

###  data

▸ **data**<`TData`>(spec: *`object`*): [ResultBuilder](resultbuilder.md)

Set data mutation specs

**Type parameters:**

#### TData 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| spec | `object` |  - |

**Returns:** [ResultBuilder](resultbuilder.md)

___
<a id="eventtimeout"></a>

###  eventTimeout

▸ **eventTimeout**(time: *[Timeout](../#timeout)*): [ResultBuilder](resultbuilder.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](../#timeout) |  - |

**Returns:** [ResultBuilder](resultbuilder.md)

___
<a id="internalevent"></a>

###  internalEvent

▸ **internalEvent**(context?: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): [ResultBuilder](resultbuilder.md)

Adds an event of type 'internal'

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` context | [EventContext](../#eventcontext) |  - |
| `Optional` extra | [EventExtra](../#eventextra) |   |

**Returns:** [ResultBuilder](resultbuilder.md)

___
<a id="nextevent"></a>

###  nextEvent

▸ **nextEvent**(type: *[EventType](../#eventtype)*, context?: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): [ResultBuilder](resultbuilder.md)

Adds a next-event action

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| type | [EventType](../#eventtype) |  the next event's type |
| `Optional` context | [EventContext](../#eventcontext) |  optional event context |
| `Optional` extra | [EventExtra](../#eventextra) |   |

**Returns:** [ResultBuilder](resultbuilder.md)

___
<a id="postpone"></a>

###  postpone

▸ **postpone**(): [ResultBuilder](resultbuilder.md)

Adds a postpone action

**Returns:** [ResultBuilder](resultbuilder.md)

___
<a id="reply"></a>

###  reply

▸ **reply**(from: *[From](../#from)*, msg?: *`any`*): [ResultBuilder](resultbuilder.md)

Adds a {Reply} action

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| from | [From](../#from) |  sends the reply here |
| `Optional` msg | `any` |  the message to send |

**Returns:** [ResultBuilder](resultbuilder.md)

___
<a id="statetimeout"></a>

###  stateTimeout

▸ **stateTimeout**(time: *[Timeout](../#timeout)*): [ResultBuilder](resultbuilder.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](../#timeout) |  - |

**Returns:** [ResultBuilder](resultbuilder.md)

___
<a id="timeout"></a>

###  timeout

▸ **timeout**(time: *[Timeout](../#timeout)*, name?: * `undefined` &#124; `string`*): [ResultBuilder](resultbuilder.md)

Adds a {GenericTimeout} action with the given timeout and optional name

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](../#timeout) |  the timeout in ms |
| `Optional` name |  `undefined` &#124; `string`|  optional name |

**Returns:** [ResultBuilder](resultbuilder.md)
this

___

