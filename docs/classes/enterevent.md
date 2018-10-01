[gen-statem](../README.md) > [EnterEvent](../classes/enterevent.md)

# Class: EnterEvent

An 'enter' event. Emitted by the state machine when a state is entered.

## Hierarchy

 `Event`

**↳ EnterEvent**

## Index

### Constructors

* [constructor](enterevent.md#constructor)

### Properties

* [context](enterevent.md#context)
* [extra](enterevent.md#extra)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new EnterEvent**(context?: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): [EnterEvent](enterevent.md)

Constructor

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` context | [EventContext](../#eventcontext) |  Event data |
| `Optional` extra | [EventExtra](../#eventextra) |  Extra event data. |

**Returns:** [EnterEvent](enterevent.md)

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

