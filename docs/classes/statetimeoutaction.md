[gen-statem](../README.md) > [StateTimeoutAction](../classes/statetimeoutaction.md)

# Class: StateTimeoutAction

Generates a {StateTimeoutEvent} unless the state changes within the specified timeout interval

## Hierarchy

 `TimeoutAction`

**↳ StateTimeoutAction**

## Index

### Constructors

* [constructor](statetimeoutaction.md#constructor)

### Properties

* [time](statetimeoutaction.md#time)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new StateTimeoutAction**(time: *[Timeout](../#timeout)*): [StateTimeoutAction](statetimeoutaction.md)

Creates a new TimeoutAction

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](../#timeout) |  the timeout in ms |

**Returns:** [StateTimeoutAction](statetimeoutaction.md)

___

## Properties

<a id="time"></a>

###  time

**● time**: *[Timeout](../#timeout)*

the timeout in ms

___

