[gen-statem](../README.md) > [KeepState](../classes/keepstate.md)

# Class: KeepState

Instructs the state machine to keep state (i.e. transition to the same state) Data mutations are provided.

## Type parameters
#### TData 
## Hierarchy

 `ResultWithData`<`TData`>

**↳ KeepState**

## Index

### Constructors

* [constructor](keepstate.md#constructor)

### Properties

* [hasData](keepstate.md#hasdata)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new KeepState**(newData: *`TData`*, ...actions: *`ActionList`*): [KeepState](keepstate.md)

**Parameters:**

| Param | Type |
| ------ | ------ |
| newData | `TData` |
| `Rest` actions | `ActionList` |

**Returns:** [KeepState](keepstate.md)

___

## Properties

<a id="hasdata"></a>

###  hasData

**● hasData**: *`boolean`* = false

___

