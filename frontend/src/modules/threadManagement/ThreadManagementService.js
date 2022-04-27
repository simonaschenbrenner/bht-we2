import { getThreadErrorAction, getThreadPendingAction, getThreadFetchAllOfGroupSuccessAction, getThreadSelectedAction } from "./ThreadManagementAction"
import { handleResponse } from "../Utils";
import config from "../../config/default.json";
const serviceID = "threads"

export function fetchAllThreadsOfGroup(token, gid) {
    return dispatch => {
        dispatch(getThreadPendingAction());
        
        // NEEDS TO BE CHANGED!
        if(!gid) {
            let groupEndpoint = config.api.url + "groups/public";
            fetch(groupEndpoint, { method: "GET" }).then(
                response => {
                    handleResponse(response, (error, data) => {
                        if(error || !data) {
                            dispatch(getThreadErrorAction(error));
                        } else {
                            let groupID = data.body[0]._id;
                            let endpoint = config.api.url + serviceID;
                            if(token) endpoint += "/all?gid=" + groupID;
                            else endpoint += "/public?gid=" + groupID;
                            fetch(endpoint, { method: "GET" }).then(
                                response => {
                                    handleResponse(response, (error, threads) => {
                                        if(error || !threads) {
                                            dispatch(getThreadErrorAction(error));
                                        } else {
                                            dispatch(getThreadFetchAllOfGroupSuccessAction(threads));
                                        }
                                    })
                                },
                                error => {
                                    dispatch(getThreadErrorAction(error));
                                }
                            )
                        }
                    })
                }
            )
        } else {
            let groupID = gid;
            let endpoint = config.api.url + serviceID;
            if(token) endpoint += "/all?gid=" + groupID;
            else endpoint += "/public?gid=" + groupID;
            const requestOptions = {
                method: "GET",
                headers: { "Authorization": "Bearer " + token }
            };
            fetch(endpoint, requestOptions).then(
                response => {
                    handleResponse(response, (error, threads) => {
                        if(error || !threads) {
                            dispatch(getThreadErrorAction(error));
                        } else {
                            dispatch(getThreadFetchAllOfGroupSuccessAction(threads));
                        }
                    })
                },
                error => {
                    dispatch(getThreadErrorAction(error));
                }
            )
        }
    }
}

export function selectThread(threadID) {
    return dispatch => {
        dispatch(getThreadSelectedAction(threadID));
    } 
}