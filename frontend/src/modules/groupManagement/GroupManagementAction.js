export const GROUP_PENDING = "group-pending";
export const GROUP_FETCH_ALL_SUCCESS = "group-fetch-all-success";
export const GROUP_SELECTED = "group-selected";
export const GROUP_ERROR = "group-error";

export function getGroupPendingAction() {
    return {
        type: GROUP_PENDING
    }
}

export function getGroupFetchAllSuccessAction(data) {
    return {
        type: GROUP_FETCH_ALL_SUCCESS,
        all: data.body,
        token: data.token
    }
}

export function getGroupSelectedAction(data) {
    return {
        type: GROUP_SELECTED,
        selected: data
    }
}

export function getGroupErrorAction(error) {
    return {
        type: GROUP_ERROR,
        error: error
    }
}