[gen-statem](../README.md) > [StateTimeoutEvent](../classes/statetimeoutevent.md)

# Class: StateTimeoutEvent

Sets a timer that fires unless the state machines transitions to a different state.

## Hierarchy

 `TimeoutEvent`

**↳ StateTimeoutEvent**

## Index

### Constructors

* [constructor](statetimeoutevent.md#constructor)

### Properties

* [context](statetimeoutevent.md#context)
* [extra](statetimeoutevent.md#extra)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new StateTimeoutEvent**(context?: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): [StateTimeoutEvent](statetimeoutevent.md)

Constructor

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` context | [EventContext](../#eventcontext) |  Event data |
| `Optional` extra | [EventExtra](../#eventextra) |  Extra event data. |

**Returns:** [StateTimeoutEvent](statetimeoutevent.md)

___

## Properties

<a id="context"></a>

### `<Optional>` context

**● context**: *[EventContext](../#eventcontext)*

Event data

___
<a id="extra"></a>

### `<Optional>` extra

**● extra**: *[EventExtra](../#eventextra)*

Extra event data.

___

