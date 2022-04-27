export const USER_PENDING = "user-pending";
export const USER_FETCH_SUCCESS = "user-fetch-success";
export const SHOW_USER_SETTINGS = "show-user-settings";
export const CLOSE_USER_SETTINGS = "close-user-settings";
export const USER_ERROR = "user-error";

export function getUserPendingAction() {
    return {
        type: USER_PENDING
    }
}

export function getUserFetchSuccessAction(data) {
    return {
        type: USER_FETCH_SUCCESS,
        user: data.body,
        token: data.token
    }
}

export function getShowUserSettingsAction() {
    return {
        type: SHOW_USER_SETTINGS,
    }
}

export function getCloseUserSettingsAction() {
    return {
        type: CLOSE_USER_SETTINGS,
    }
}

export function getUserErrorAction(error) {
    return {
        type: USER_ERROR,
        error: error
    }
}