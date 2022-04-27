import { getAuthenticationErrorAction, getAuthenticationPendingAction, getAuthenticationSuccessAction, getLogoutSuccessAction } from "./AuthenticationAction"
import config from "../../config/default.json";

export function authenticateUser(userID, password) {
    return dispatch => {
        dispatch(getAuthenticationPendingAction());
        const endpoint = config.api.url + config.api.endpoints.authentication;
        const credentials = btoa(userID + ":" + password);
        const requestOptions = { method: "POST", headers: { "Authorization": "Basic " + credentials } };
        fetch(endpoint, requestOptions)
        .then(handleResponse)
        .then(
            userSession => {
                dispatch(getAuthenticationSuccessAction(userSession));
            },
            error => {
                dispatch(getAuthenticationErrorAction(error));
            }
        )
        .catch(error => {
            dispatch(getAuthenticationErrorAction(error));
        })
    }
}

function handleResponse(response) {
    return response.text().then(text => {
        if (!response.ok) {
            return Promise.reject(text);
        } else {
            let authHeader = response.headers.get("Authorization");
            if (authHeader) {
                authHeader = authHeader.split(" ");
                if (authHeader[0] === "Bearer") {
                    let data = JSON.parse(text);
                    let userSession = { user: data, token: authHeader[1] };
                    return userSession;
                } else {
                    return Promise.reject("Bad response");
                }
            } else {
                return Promise.reject("Bad response");
            }
        }
    });
}

export function logout() {
    return dispatch => {
        dispatch(getLogoutSuccessAction());
    }
}