[gen-statem](../README.md) > [NextStateWithData](../classes/nextstatewithdata.md)

# Class: NextStateWithData

Represents a state transition, maybe to the same state. Updates the state machine's data

## Type parameters
#### TData 
## Hierarchy

 `ResultWithData`<`TData`>

**↳ NextStateWithData**

## Implements

* `Stateful`

## Index

### Constructors

* [constructor](nextstatewithdata.md#constructor)

### Properties

* [hasData](nextstatewithdata.md#hasdata)
* [nextState](nextstatewithdata.md#nextstate)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new NextStateWithData**(nextState: *[State](../#state)*, newData: *`TData`*, ...actions: *`ActionList`*): [NextStateWithData](nextstatewithdata.md)

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| nextState | [State](../#state) |  the next state to go to |
| newData | `TData` |  new state machine data |
| `Rest` actions | `ActionList` |  transition actions |

**Returns:** [NextStateWithData](nextstatewithdata.md)

___

## Properties

<a id="hasdata"></a>

###  hasData

**● hasData**: *`boolean`* = false

___
<a id="nextstate"></a>

###  nextState

**● nextState**: *[State](../#state)*

the next state to go to

___

