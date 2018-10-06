[gen-statem](../README.md) > [Response](../classes/response.md)

# Class: Response

## Hierarchy

**Response**

## Index

### Accessors

* [builder](response.md#builder)

### Methods

* [data](response.md#data)
* [eventTimeout](response.md#eventtimeout)
* [internalEvent](response.md#internalevent)
* [keepState](response.md#keepstate)
* [nextEvent](response.md#nextevent)
* [nextState](response.md#nextstate)
* [repeatState](response.md#repeatstate)
* [reply](response.md#reply)
* [stateTimeout](response.md#statetimeout)
* [timeout](response.md#timeout)

---

## Accessors

<a id="builder"></a>

###  builder

getbuilder(): [ResultBuilder](resultbuilder.md)setbuilder(value: *[ResultBuilder](resultbuilder.md)*): `void`

**Returns:** [ResultBuilder](resultbuilder.md)

**Parameters:**

| Param | Type |
| ------ | ------ |
| value | [ResultBuilder](resultbuilder.md) |

**Returns:** `void`

___

## Methods

<a id="data"></a>

###  data

▸ **data**<`TData`>(spec: *`Spec`<`TData`>*): [Response](response.md)

Helper to only mutate data

**Type parameters:**

#### TData 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| spec | `Spec`<`TData`> |  - |

**Returns:** [Response](response.md)

___
<a id="eventtimeout"></a>

###  eventTimeout

▸ **eventTimeout**(time: *[Timeout](../#timeout)*): [Response](response.md)

Helper function to set the event timeout timer

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](../#timeout) |  - |

**Returns:** [Response](response.md)

___
<a id="internalevent"></a>

###  internalEvent

▸ **internalEvent**(context?: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): [Response](response.md)

Helper function to insert an 'internal' event

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` context | [EventContext](../#eventcontext) |  - |
| `Optional` extra | [EventExtra](../#eventextra) |  - |

**Returns:** [Response](response.md)

___
<a id="keepstate"></a>

###  keepState

▸ **keepState**(): [Response](response.md)

**Returns:** [Response](response.md)

___
<a id="nextevent"></a>

###  nextEvent

▸ **nextEvent**(type: *[EventType](../#eventtype)*, context?: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): [Response](response.md)

Helper function to insert a new event

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| type | [EventType](../#eventtype) |  - |
| `Optional` context | [EventContext](../#eventcontext) |  - |
| `Optional` extra | [EventExtra](../#eventextra) |  - |

**Returns:** [Response](response.md)

___
<a id="nextstate"></a>

###  nextState

▸ **nextState**(state: *[State](../#state)*): [Response](response.md)

Returns a [NextStateBuilder](nextstatebuilder.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| state | [State](../#state) |  - |

**Returns:** [Response](response.md)

___
<a id="repeatstate"></a>

###  repeatState

▸ **repeatState**(): [Response](response.md)

Returns a [RepeatStateBuilder](repeatstatebuilder.md)

**Returns:** [Response](response.md)

___
<a id="reply"></a>

###  reply

▸ **reply**(from: *`string`*, msg: *`any`*): [Response](response.md)

Helper function to return a reply

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| from | `string` |  - |
| msg | `any` |  - |

**Returns:** [Response](response.md)

___
<a id="statetimeout"></a>

###  stateTimeout

▸ **stateTimeout**(time: *[Timeout](../#timeout)*): [Response](response.md)

Helper function to set a state timeout (keeps state and data)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](../#timeout) |  - |

**Returns:** [Response](response.md)

___
<a id="timeout"></a>

###  timeout

▸ **timeout**(time: *[Timeout](../#timeout)*): [Response](response.md)

helper function to set a generic timer

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](../#timeout) |  - |

**Returns:** [Response](response.md)

___

