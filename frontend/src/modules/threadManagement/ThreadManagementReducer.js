import { THREAD_PENDING, THREAD_FETCH_ALL_OF_GROUP_SUCCESS, THREAD_ERROR, THREAD_SELECTED } from "./ThreadManagementAction"

const initialState = {
    all: null,
    pending: true,
    selected: null,
    error: null
}

function threadManagementReducer(state = initialState, action) {

    switch (action.type) {
        case THREAD_PENDING:
            return {
                ...state,
                pending: true,
                error: null
            }
        case THREAD_FETCH_ALL_OF_GROUP_SUCCESS:
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
        case THREAD_SELECTED:
            return {
                ...state,
                selected: action.selected
            }
        case THREAD_ERROR:
            return {
                ...state,
                pending: false,
                error: action.error
            }
        default:
            return state;
    }
}

export default threadManagementReducer;