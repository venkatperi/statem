import ResultWithData from "./ResultWithData";
import {Data,} from "../types";
import {ActionList} from "../action";
import {Stateful} from "./Stateful";
import {State} from "../State";

/**
 * Represents a state transition, maybe to the same state.
 * Updates the state machine's data
 */
export default class NextStateWithData extends ResultWithData implements Stateful {
    type = "nextState";
    nextState: State;

    constructor(nextState: State, newData?: Data, ...actions: ActionList) {
        super(newData, ...actions);
        this.nextState = nextState;
    }
}
