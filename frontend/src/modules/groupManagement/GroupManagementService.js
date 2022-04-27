import { getGroupErrorAction, getGroupPendingAction, getGroupFetchAllSuccessAction, getGroupSelectedAction } from "./GroupManagementAction"
import { handleResponse } from "../Utils";
import config from "../../config/default.json";

export function fetchAllGroups(token, userID) {
    return dispatch => {
        dispatch(getGroupPendingAction());
        let endpoint = config.api.url;
        if(token && userID) endpoint += config.api.endpoints.groups.all + "?uid=" + userID;
        else endpoint += config.api.endpoints.groups.public;
        const requestOptions = {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        };
        fetch(endpoint, requestOptions).then(
            response => {
                handleResponse(response, (error, groups) => {
                    if(error || !groups) {
                        dispatch(getGroupErrorAction(error));
                    } else {
                        dispatch(getGroupFetchAllSuccessAction(groups));
                    }
                })
            },
            error => {
                dispatch(getGroupErrorAction(error));
            }
        )
    }
}

export function selectGroup(groupID) {
    return dispatch => {
        dispatch(getGroupSelectedAction(groupID))
    }
}