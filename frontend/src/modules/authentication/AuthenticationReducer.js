import { AUTHENTICATION_PENDING, AUTHENTICATION_SUCCESS, AUTHENTICATION_ERROR, LOGOUT_SUCCESS } from "./AuthenticationAction"

const initialState = {
    userID: null,
    userName: null,
    pending: false,
    loggedIn: false,
    token: null,
    isAdmin: false,
    error: null
}

function authenticationReducer(state = initialState, action) {
    
    switch (action.type) {
        case AUTHENTICATION_PENDING:
            return {
                ...state,
                userID: null,
                userName: null,
                pending: true,
                loggedIn: false,
                token: null,
                isAdmin: false,
                error: null
            }
        case AUTHENTICATION_SUCCESS:
            return {
                ...state,
                userID: action.userID,
                userName: action.userName,
                pending: false,
                loggedIn: true,
                token: action.token,
                isAdmin: (action.role === "admin"),
                error: null
            }
        case AUTHENTICATION_ERROR:
            return {
                ...state,
                userID: null,
                userName: null,
                pending: false,
                loggedIn: false,
                token: null,
                error: action.error
            }
        case LOGOUT_SUCCESS:
            return {
                ...state,
                userID: null,
                userName: null,
                pending: false,
                loggedIn: false,
                token: null,
                isAdmin: false,
                error: null
            }
        default:
            if(!action.token) {
                return state;
            } else {
                return {
                    ...state,
                    token: action.token
                }
            }
    }
}

export default authenticationReducer;