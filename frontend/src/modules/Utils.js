// Extracts the token from the header and parses the JSON body if the response is OK
export function handleResponse(response, callback) {
    response.text().then(
        text => {
            // console.log(text);
            if (!response.ok) {
                callback("Error " + response.status + ": " + text);
            } else {
                let data = { body: JSON.parse(text) };
                let authHeader = response.headers.get("Authorization");
                if (!authHeader) {
                    callback(null, data);
                } else {
                    authHeader = authHeader.split(" ");
                    if (authHeader[0] !== "Bearer") {
                        callback(null, data);
                    } else {
                        let dataWithToken = { body: data.body, token: authHeader[1] }
                        callback(null, dataWithToken);
                    }
                }
            }
        },
        error => {
            callback("Could not process response: " + error);
        }
    );
}