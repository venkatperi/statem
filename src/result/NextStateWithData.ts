import { ActionList } from "../action";
import { State } from "../State";
import { ResultType } from "../types"
import ResultWithData from "./ResultWithData";
import { Stateful } from "./Stateful";


/**
 * Represents a state transition, maybe to the same state.
 * Updates the state machine's data
 */
export default class NextStateWithData<TData> extends ResultWithData<TData>
    implements Stateful {
    /**
     * @hidden
     * @type {"nextState"}
     */
    type: ResultType = "nextState";

    /**
     * @param nextState - the next state to go to
     * @param newData - new state machine data
     * @param actions - transition actions
     */
    constructor(public nextState: State,
        newData: TData, ...actions: ActionList) {
        super(newData, ...actions);
    }
}
