import { State } from "../State";
import { ActionList } from "../action";
import { Data, } from "../types";
import ResultWithData from "./ResultWithData";
import { Stateful } from "./Stateful";


/**
 * Represents a state transition, maybe to the same state.
 * Updates the state machine's data
 */
export default class NextStateWithData extends ResultWithData
    implements Stateful {
    type = "nextState";

    constructor(public nextState: State, newData?: Data,
        ...actions: ActionList) {
        super(newData, ...actions);
    }
}
