import { getUserErrorAction, getUserPendingAction, getUserFetchSuccessAction, getShowUserSettingsAction, getCloseUserSettingsAction } from "./UserManagementAction"
import { handleResponse } from "../Utils";
import config from "../../config/default.json";
const serviceID = "users"

export function fetchUser(token, userID) {
    return dispatch => {
        dispatch(getUserPendingAction());
        const endpoint = config.api.url + serviceID + "/" + userID;
        const requestOptions = {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        };
        fetch(endpoint, requestOptions).then(
            response => {
                handleResponse(response, (error, user) => {
                    if(error || !user) {
                        dispatch(getUserErrorAction(error));
                    } else {
                        dispatch(getUserFetchSuccessAction(user));
                    }
                })
            },
            error => {
                dispatch(getUserErrorAction(error));
            }
        )
    }
}

export function showUserSettings() {
    return dispatch => {
        dispatch(getShowUserSettingsAction());
    }
}

export function closeUserSettings() {
    return dispatch => {
        dispatch(getCloseUserSettingsAction());
    }
}

// function handleResponse(response) {
//     return response.text().then(text => {
//         if (!response.ok) {
//             return Promise.reject(text);
//         } else {
//             let authHeader = response.headers.get("Authorization");
//             if (authHeader) {
//                 authHeader = authHeader.split(" ");
//                 if (authHeader[0] === "Bearer") {
//                     let data = JSON.parse(text);
//                     let user = { ...data, token: authHeader[1] };
//                     return user;
//                 } else {
//                     return Promise.reject("Bad response");
//                 }
//             } else {
//                 return Promise.reject("Bad response");
//             }
//         }
//     });
// }