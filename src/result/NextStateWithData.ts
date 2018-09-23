import { ActionList } from "../action";
import { State } from "../State";
import ResultWithData from "./ResultWithData";
import { Stateful } from "./Stateful";


/**
 * Represents a state transition, maybe to the same state.
 * Updates the state machine's data
 */
export default class NextStateWithData<TData> extends ResultWithData<TData>
    implements Stateful {
    type = "nextState";

    constructor(public nextState: State,
        newData: TData, ...actions: ActionList) {
        super(newData, ...actions);
    }
}
