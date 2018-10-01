[gen-statem](../README.md) > [GenericTimeoutAction](../classes/generictimeoutaction.md)

# Class: GenericTimeoutAction

Generates a {GenericTimeoutEvent} after the specified timeout interval

## Hierarchy

 `TimeoutAction`

**↳ GenericTimeoutAction**

## Index

### Constructors

* [constructor](generictimeoutaction.md#constructor)

### Properties

* [name](generictimeoutaction.md#name)
* [time](generictimeoutaction.md#time)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new GenericTimeoutAction**(time: *[Timeout](../#timeout)*, name?: * `undefined` &#124; `string`*): [GenericTimeoutAction](generictimeoutaction.md)

Creates a generic timeout action

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| time | [Timeout](../#timeout) |  - |
| `Optional` name |  `undefined` &#124; `string`|   |

**Returns:** [GenericTimeoutAction](generictimeoutaction.md)

___

## Properties

<a id="name"></a>

### `<Optional>` name

**● name**: * `undefined` &#124; `string`
*

___
<a id="time"></a>

###  time

**● time**: *[Timeout](../#timeout)*

the timeout in ms

___

