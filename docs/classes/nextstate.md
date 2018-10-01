[gen-statem](../README.md) > [NextState](../classes/nextstate.md)

# Class: NextState

Represents a state transition, maybe to the same state. Keeps the current data

## Hierarchy

 `Result`

**↳ NextState**

↳  [Stop](stop.md)

## Implements

* `Stateful`

## Index

### Constructors

* [constructor](nextstate.md#constructor)

### Properties

* [nextState](nextstate.md#nextstate-1)

### Methods

* [toString](nextstate.md#tostring)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new NextState**(nextState: *[State](../#state)*, ...actions: *`ActionList`*): [NextState](nextstate.md)

Creates a {NextState} result

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| nextState | [State](../#state) |  the next state to go to. |
| `Rest` actions | `ActionList` |  List of transition actions |

**Returns:** [NextState](nextstate.md)

___

## Properties

<a id="nextstate-1"></a>

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

