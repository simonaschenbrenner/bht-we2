export const AUTHENTICATION_PENDING = "authentication-pending";
export const AUTHENTICATION_SUCCESS = "authentication-success";
export const AUTHENTICATION_ERROR = "authentication-error";
export const LOGOUT_SUCCESS = "logout-success";

export function getAuthenticationPendingAction() {
    return {
        type: AUTHENTICATION_PENDING,
    }
}

export function getAuthenticationSuccessAction(userSession) {
    return {
        type: AUTHENTICATION_SUCCESS,
        userID: userSession.user.id,
        userName: userSession.user.firstName,
        role: userSession.user.role,
        token: userSession.token
    }
}

export function getAuthenticationErrorAction(error) {
    return {
        type: AUTHENTICATION_ERROR,
        error: error
    }
}

export function getLogoutSuccessAction() {
    return {
        type: LOGOUT_SUCCESS,
    }
}