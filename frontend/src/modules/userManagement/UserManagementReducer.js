import { USER_PENDING, USER_FETCH_SUCCESS, SHOW_USER_SETTINGS, CLOSE_USER_SETTINGS, USER_ERROR } from "./UserManagementAction"

const initialState = {
    _id: null,
    email: null,
    firstName: null,
    lastName: null,
    registered: null,
    role: null,
    pending: false,
    showSettings: false,
    error: null
}

function userManagementReducer(state = initialState, action) {

    switch (action.type) {
        case USER_PENDING:
            return {
                ...state,
                pending: true,
                error: null
            }
        case USER_FETCH_SUCCESS:
            return {
                ...state,
                _id: action.user._id,
                email: action.user.email,
                firstName: action.user.firstName,
                lastName: action.user.lastName,
                registered: action.user.registered,
                role: action.user.role,
                pending: false,
                error: null
            }
        case SHOW_USER_SETTINGS:
            return  {
                ...state,
                showSettings: true
            }
        case CLOSE_USER_SETTINGS:
            return  {
                ...state,
                showSettings: false
            }
        case USER_ERROR:
            return {
                ...state,
                pending: false,
                error: action.error
            }
        default:
            return state;
    }
}

export default userManagementReducer;