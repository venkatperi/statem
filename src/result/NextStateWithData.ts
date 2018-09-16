import ResultWithData from "./ResultWithData";
import {Data, State} from "../types";
import {ActionList} from "../action";
import {Stateful} from "./Stateful";

export default class NextStateWithData extends ResultWithData implements Stateful {
    type = "nextState";
    nextState: State;

    constructor(nextState: State, newData?: Data, ...actions: ActionList) {
        super(newData, ...actions);
        this.nextState = nextState;
    }
}
