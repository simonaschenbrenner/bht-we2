import { getMessageErrorAction, getMessagePendingAction, getMessageFetchAllOfThreadSuccessAction, getMessageUpdateSuccessAction, getMessageSelectAction, getMessageDeletedSuccessAction, getMessageAddSuccessAction } from "./MessageManagementAction"
import { handleResponse } from "../Utils";
import config from "../../config/default.json";

export function fetchAllMessagesOfThread(token, gid, tid) {
    return dispatch => {
        dispatch(getMessagePendingAction());
        if(token && gid && tid) {
            let endpoint = config.api.url + config.api.endpoints.messages.all + "?gid=" + gid + "&tid=" + tid;
            const requestOptions = {
                method: "GET",
                headers: { "Authorization": "Bearer " + token }
            };
            fetch(endpoint, requestOptions).then(
                response => {
                    handleResponse(response, async (error, data) => {
                        if(error || !data) {
                            dispatch(getMessageErrorAction(error));
                        } else {
                            let messages = data.body;
                            for(let message of messages) {
                                let author = await getAuthor(token, message.authorId);
                                Object.assign(message, author);
                            }
                            dispatch(getMessageFetchAllOfThreadSuccessAction({ body: messages, token: data.token }));
                        }
                    })
                },
                error => {
                    dispatch(getMessageErrorAction(error));
                }
            )
        } else {
            dispatch(getMessageErrorAction());
        }
    }
}

async function getAuthor(token, userId) {
    const endpoint = config.api.url + config.api.endpoints.users + "/" + userId;
    const requestOptions = {
        method: "GET",
        headers: { "Authorization": "Bearer " + token }
    };
    let response = await fetch(endpoint, requestOptions);
    if (response.ok) {
        let text = await response.text();
        let user = JSON.parse(text);
        return { firstName: user.firstName, lastName: user.lastName };
    } else {
        return { firstName: "Anonym" };
    }
}

export function selectMessage(mid) {
    return dispatch => {
        dispatch(getMessageSelectAction(mid));
    }
}

export function updateMessage(token, mid, newContent) {
    return dispatch => {
        dispatch(getMessagePendingAction());
        if(token && mid && newContent) {
            let endpoint = config.api.url + config.api.endpoints.messages.update + mid;
            const requestOptions = {
                method: "PUT",
                headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
                body: JSON.stringify({content: newContent})
            };
            fetch(endpoint, requestOptions).then(
                response => {
                    handleResponse(response, (error, data) => {
                        if(error || !data) {
                            dispatch(getMessageErrorAction(error));
                        } else {
                            dispatch(getMessageUpdateSuccessAction(data));
                        }
                    })
                },
                error => {
                    dispatch(getMessageErrorAction(error));
                }
            )
        } else {
            dispatch(getMessageErrorAction());
        }
    }
}

export function addMessage(token, gid, tid, content) {
    return dispatch => {
        dispatch(getMessagePendingAction());
        if(token && gid && tid && content) {
            let endpoint = config.api.url + config.api.endpoints.messages.add;
            let message = { groupId: gid, threadId: tid, content: content };
            const requestOptions = {
                method: "POST",
                headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
                body: JSON.stringify(message)
            };
            fetch(endpoint, requestOptions).then(
                response => {
                    handleResponse(response, async (error, data) => {
                        if(error || !data) {
                            dispatch(getMessageErrorAction(error));
                        } else {
                            let message = data.body;
                            let author = await getAuthor(token, message.authorId);
                            Object.assign(message, author);
                            dispatch(getMessageAddSuccessAction({ body: message, token: data.token }));
                        }
                    })
                },
                error => {
                    dispatch(getMessageErrorAction(error));
                }
            )
        } else {
            dispatch(getMessageErrorAction());
        }
    }
}

export function deleteMessage(token, mid) {
    return dispatch => {
        dispatch(getMessagePendingAction());
        if(token && mid) {
            let endpoint = config.api.url + config.api.endpoints.messages.delete + mid;
            const requestOptions = {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token },
            };
            fetch(endpoint, requestOptions).then(
                response => {
                    if(response.ok) {
                        dispatch(getMessageDeletedSuccessAction(mid));
                    } else {
                        dispatch(getMessageErrorAction());
                    }
                },
                error => {
                    dispatch(getMessageErrorAction(error));
                }
            )
        } else {
            dispatch(getMessageErrorAction());
        }
    }
}