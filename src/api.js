//let baseURL;
let baseURL = 'https://api.kavenegar.io/voice/v1';

if (localStorage.getItem("BASE_URL") != null) {
    baseURL = localStorage.getItem("BASE_URL");
}


function getApiToken() {
    return localStorage.getItem("ApplicationToken");
}

function getEndpoints() {
    return fetch(`${baseURL}/endpoints`, {
        headers: {
            'Authorization': 'Bearer ' + getApiToken()
        }
    }).then(response => response.json());
}

function getCalls() {
    return fetch(`${baseURL}/calls`, {
        headers: {
            'Authorization': 'Bearer ' + getApiToken()
        }
    }).then(response => response.json());
}


function getSessions() {
    return fetch(`${baseURL}/sessions`, {
        headers: {
            'Authorization': 'Bearer ' + getApiToken()
        }
    }).then(response => response.json());
}


function createCall(call) {

    return fetch(`${baseURL}/calls`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getApiToken()
        },
        body: JSON.stringify(call)
    }).then(response => response.json());
}


const HttpClient = {
    getCalls, getEndpoints, getSessions, createCall
};

export default HttpClient;