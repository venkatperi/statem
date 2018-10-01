[gen-statem](../README.md) > [Stop](../classes/stop.md)

# Class: Stop

Instructs the state machine to stop.

## Hierarchy

↳  [NextState](nextstate.md)

**↳ Stop**

## Implements

* `Stateful`

## Index

### Constructors

* [constructor](stop.md#constructor)

### Properties

* [nextState](stop.md#nextstate)

### Methods

* [toString](stop.md#tostring)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Stop**(nextState: *[State](../#state)*, ...actions: *`ActionList`*): [Stop](stop.md)

Creates a {NextState} result

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| nextState | [State](../#state) |  the next state to go to. |
| `Rest` actions | `ActionList` |  List of transition actions |

**Returns:** [Stop](stop.md)

___

## Properties

<a id="nextstate"></a>

###  nextState

**● nextState**: *[State](../#state)*

the next state to go to.

___

## Methods

<a id="tostring"></a>

###  toString

▸ **toString**(): `string`

**Returns:** `string`

___

