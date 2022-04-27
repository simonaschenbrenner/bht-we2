import { MESSAGE_PENDING, MESSAGE_FETCH_ALL_OF_THREAD_SUCCESS, MESSAGE_UPDATE_SUCCESS, MESSAGE_SELECT, MESSAGE_ADD, MESSAGE_DELETED, MESSAGE_ERROR } from "./MessageManagementAction"

const initialState = {
    all: [],
    pending: true,
    deletion: false,
    selected: null,
    updated: false,
    error: null
}

function messageManagementReducer(state = initialState, action) {

    switch (action.type) {
        case MESSAGE_PENDING:
            return {
                ...state,
                pending: true,
                updated: false,
                error: null
            }
        case MESSAGE_FETCH_ALL_OF_THREAD_SUCCESS:
            return {
                ...state,
                deletion: false,
                all: action.all,
                pending: false,
                updated: false,
                error: null
            }
        case MESSAGE_UPDATE_SUCCESS:
            return {
                ...state,
                pending: false,
                deletion: false,
                updated: true,
                error: null
            }
        case MESSAGE_SELECT:
            return {
                ...state,
                updated: false,
                deletion: false,
                selected: action.selected,
                error: null
            }
        case MESSAGE_ADD:
            state.all.push(action.newMessage);
            console.log(state.all);
            return {
                ...state,
                deletion: false,
                pending: false,
                error: null
            }
        case MESSAGE_DELETED:
            state.all.map((message) => {
                if(message._id === action.mid) message = null;
                return null;
            })
            return {
                ...state,
                deletion: true,
                pending: false,
                error: null
            }
        case MESSAGE_ERROR:
            return {
                ...state,
                all: [],
                deletion: false,
                pending: false,
                updated: false,
                error: action.error
            }
        default:
            return state;
    }
}

export default messageManagementReducer;