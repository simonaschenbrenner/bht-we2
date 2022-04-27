import { GROUP_PENDING, GROUP_FETCH_ALL_SUCCESS, GROUP_SELECTED, GROUP_ERROR } from "./GroupManagementAction"

const initialState = {
    all: null,
    pending: true,
    error: null,
    selected: null
}

function groupManagementReducer(state = initialState, action) {

    switch (action.type) {
        case GROUP_PENDING:
            return {
                ...state,
                pending: true,
                error: null
            }
        case GROUP_FETCH_ALL_SUCCESS:
            if (!state.selected) {
                return {
                    ...state,
                    all: action.all,
                    selected: action.all[0]._id,
                    pending: false,
                    error: null
                }
            }
            return {
                ...state,
                all: action.all,
                pending: false,
                error: null
            }
        case GROUP_SELECTED:
            return {
                ...state,
                selected: action.selected
            }
        case GROUP_ERROR:
            return {
                ...state,
                pending: false,
                error: action.error
            }
        default:
            return state;
    }
}

export default groupManagementReducer;