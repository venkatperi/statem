[gen-statem](../README.md) > [SMOptions](../interfaces/smoptions.md)

# Interface: SMOptions

State Machine Initialization options

## Type parameters
#### TData 
## Hierarchy

**SMOptions**

↳  [IStateMachine](istatemachine.md)

## Index

### Properties

* [handlers](smoptions.md#handlers)
* [initialData](smoptions.md#initialdata)
* [initialState](smoptions.md#initialstate)

---

## Properties

<a id="handlers"></a>

### `<Optional>` handlers

**● handlers**: *[Handlers](../#handlers)<`TData`>*

The state machine specification.

___
<a id="initialdata"></a>

### `<Optional>` initialData

**● initialData**: * `TData` &#124; `DataFn`<`TData`>
*

Initial data. optional.

___
<a id="initialstate"></a>

### `<Optional>` initialState

**● initialState**: *[State](../#state)*

State machine's initial state. Must be defined.

___

