export const MESSAGE_PENDING = "message-pending";
export const MESSAGE_FETCH_ALL_OF_THREAD_SUCCESS = "message-fetch-all-of-thread-success";
export const MESSAGE_UPDATE_SUCCESS = "message-update-success";
export const MESSAGE_SELECT = "select-message";
export const MESSAGE_ADD = "added-message";
export const MESSAGE_DELETED = "message-deleted";
export const MESSAGE_ERROR = "message-error";

export function getMessagePendingAction() {
    return {
        type: MESSAGE_PENDING
    }
}

export function getMessageFetchAllOfThreadSuccessAction(data) {
    return {
        type: MESSAGE_FETCH_ALL_OF_THREAD_SUCCESS,
        all: data.body,
        token: data.token
    }
}

export function getMessageUpdateSuccessAction(data) {
    return {
        type: MESSAGE_UPDATE_SUCCESS,
        token: data.token
    }
}

export function getMessageSelectAction(data) {
    return {
        type: MESSAGE_SELECT,
        selected: data
    }
}

export function getMessageAddSuccessAction(data) {
    return {
        type: MESSAGE_ADD,
        newMessage: data.body
    }
}

export function getMessageDeletedSuccessAction(mid) {
    return {
        type: MESSAGE_DELETED,
        mid: mid
    }
}

export function getMessageErrorAction(error) {
    return {
        type: MESSAGE_ERROR,
        error: error
    }
}