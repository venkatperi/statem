[gen-statem](../README.md) > [CallEvent](../classes/callevent.md)

# Class: CallEvent

Represents a 'call' event.

## Hierarchy

 `Event`

**↳ CallEvent**

## Index

### Constructors

* [constructor](callevent.md#constructor)

### Properties

* [context](callevent.md#context)
* [extra](callevent.md#extra)
* [from](callevent.md#from)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new CallEvent**(from: *[From](../#from)*, context?: *[EventContext](../#eventcontext)*, extra?: *[EventExtra](../#eventextra)*): [CallEvent](callevent.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| from | [From](../#from) |  caller's id. Used by {ReplyAction} to send a response. |
| `Optional` context | [EventContext](../#eventcontext) |  Event context |
| `Optional` extra | [EventExtra](../#eventextra) |  Event extra data |

**Returns:** [CallEvent](callevent.md)

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
<a id="from"></a>

###  from

**● from**: *[From](../#from)*

caller's id. Used by {ReplyAction} to send a response.

___

