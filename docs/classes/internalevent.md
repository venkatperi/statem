[gen-statem](../README.md) > [InternalEvent](../classes/internalevent.md)

# Class: InternalEvent

Represents an internally generated event.

## Hierarchy

 `Event`

**↳ InternalEvent**

## Index

### Constructors

* [constructor](internalevent.md#constructor)

### Properties

* [context](internalevent.md#context)
* [extra](internalevent.md#extra)
* [priority](internalevent.md#priority)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new InternalEvent**(context?: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): [InternalEvent](internalevent.md)

Constructor

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` context | [EventContext](../#eventcontext) |  Event data |
| `Optional` extra | [EventExtra](../#eventextra) |  Extra event data. |

**Returns:** [InternalEvent](internalevent.md)

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
<a id="priority"></a>

###  priority

**● priority**: *[Priority](../enums/priority.md)* =  Priority.Normal

Event's priority when enqueued
*__type__*: {Priority}

___

