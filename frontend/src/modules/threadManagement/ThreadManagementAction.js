export const THREAD_PENDING = "thread-pending";
export const THREAD_FETCH_ALL_OF_GROUP_SUCCESS = "thread-fetch-all-of-group-success";
export const THREAD_SELECTED = "thread-selected";
export const THREAD_ERROR = "thread-error";

export function getThreadPendingAction() {
    return {
        type: THREAD_PENDING
    }
}

export function getThreadFetchAllOfGroupSuccessAction(data) {
    return {
        type: THREAD_FETCH_ALL_OF_GROUP_SUCCESS,
        all: data.body,
        token: data.token
    }
}

export function getThreadSelectedAction(data) {
    return {
        type: THREAD_SELECTED,
        selected: data
    }
}

export function getThreadErrorAction(error) {
    return {
        type: THREAD_ERROR,
        error: error
    }
}