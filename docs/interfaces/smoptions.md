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

* [dataProxy](smoptions.md#dataproxy)
* [handlerTimeout](smoptions.md#handlertimeout)
* [handlers](smoptions.md#handlers)
* [initialData](smoptions.md#initialdata)
* [initialState](smoptions.md#initialstate)

---

## Properties

<a id="dataproxy"></a>

### `<Optional>` dataProxy

**● dataProxy**: *[DataProxy](../#dataproxy)<`TData`>*

___
<a id="handlertimeout"></a>

### `<Optional>` handlerTimeout

**● handlerTimeout**: * `undefined` &#124; `number`
*

Watchdog timer. Fires if an event handler is taking too long.

___
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

