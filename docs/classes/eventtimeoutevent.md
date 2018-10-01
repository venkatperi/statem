[gen-statem](../README.md) > [EventTimeoutEvent](../classes/eventtimeoutevent.md)

# Class: EventTimeoutEvent

Sets a timeout that fires if unless a new event is seen.

## Hierarchy

 `TimeoutEvent`

**↳ EventTimeoutEvent**

## Index

### Constructors

* [constructor](eventtimeoutevent.md#constructor)

### Properties

* [context](eventtimeoutevent.md#context)
* [extra](eventtimeoutevent.md#extra)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new EventTimeoutEvent**(context?: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): [EventTimeoutEvent](eventtimeoutevent.md)

Constructor

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` context | [EventContext](../#eventcontext) |  Event data |
| `Optional` extra | [EventExtra](../#eventextra) |  Extra event data. |

**Returns:** [EventTimeoutEvent](eventtimeoutevent.md)

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

