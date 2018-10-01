[gen-statem](../README.md) > [RepeatState](../classes/repeatstate.md)

# Class: RepeatState

Same as the KeepState{AndData}, except that it repeats the state enter call as if this state was entered again.

## Type parameters
#### TData 
## Hierarchy

 `ResultWithData`<`TData`>

**↳ RepeatState**

## Index

### Constructors

* [constructor](repeatstate.md#constructor)

### Properties

* [hasData](repeatstate.md#hasdata)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new RepeatState**(newData: *`TData`*, ...actions: *`ActionList`*): [RepeatState](repeatstate.md)

**Parameters:**

| Param | Type |
| ------ | ------ |
| newData | `TData` |
| `Rest` actions | `ActionList` |

**Returns:** [RepeatState](repeatstate.md)

___

## Properties

<a id="hasdata"></a>

###  hasData

**● hasData**: *`boolean`* = false

___

