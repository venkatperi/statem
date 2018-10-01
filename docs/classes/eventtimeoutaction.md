[gen-statem](../README.md) > [EventTimeoutAction](../classes/eventtimeoutaction.md)

# Class: EventTimeoutAction

Generates a {EventTimeoutEvent} unless some other event is delivered within the specified timeout interval

## Hierarchy

 `TimeoutAction`

**↳ EventTimeoutAction**

## Index

### Constructors

* [constructor](eventtimeoutaction.md#constructor)

### Properties

* [time](eventtimeoutaction.md#time)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new EventTimeoutAction**(time: *[Timeout](../#timeout)*): [EventTimeoutAction](eventtimeoutaction.md)

Creates a new TimeoutAction

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](../#timeout) |  the timeout in ms |

**Returns:** [EventTimeoutAction](eventtimeoutaction.md)

___

## Properties

<a id="time"></a>

###  time

**● time**: *[Timeout](../#timeout)*

the timeout in ms

___

