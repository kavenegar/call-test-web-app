<template>
    <div class="about">
        <Toolbar title="مخاطبین"/>
        <div id="endpoints-wrapper" class="wrapper">
            <div class="">
                <ul style="list-style: none" id="endpoints-list">
                    <li v-for="endpoint in this.endpoints" @click="call(endpoint)" v-if="endpoint.username !== getAuthenticatedEndpoint().username">
                        {{endpoint.username}}

                        <b-button type="" icon-right="phone">
                        </b-button>
                        <b-button type="" icon-right="video">
                        </b-button>

                    </li>
                </ul>
            </div>
        </div>

        <BottomBar/>
    </div>
</template>
<script>
    import httpClient from "../api";
    import router from "../router";
    import Toolbar from "../components/Toolbar";
    import BottomBar from "../components/BottomBar";

    export default {
        name: 'Login',
        components: {BottomBar, Toolbar},
        data() {
            return {
                endpoints: [],
                selected: null
            };
        },
        created() {
            this.getEndpoints();
        },
        methods: {
            call(endpoint) {
                var self = this;
                var body = {
                    "caller": {
                        "username": this.getAuthenticatedEndpoint().username
                    },
                    "receptor": {
                        "username": endpoint.username,
                    },
                    "maxDuration": 1000
                };
                this.isLoading = true;
                const response = httpClient.createCall(body).then(response => {
                    self.joinCall(response.id, response.caller.accessToken);
                    self.isLoading = false;
                });
            },
            joinCall(callId, accessToken) {
                router.push({path: `/call/${callId}/${accessToken}`});
            },
            getEndpoints() {
                var self = this;
                httpClient.getEndpoints().then(response => {
                    self.endpoints = response.result;
                });
            },
            getAuthenticatedEndpoint() {
                return JSON.parse(localStorage.getItem("AuthenticatedEndpoint"));
            },
            setAuthenticatedEndpoint(username) {
                return localStorage.setItem("AuthenticatedEndpoint", username);
            },
            selectEndpoint(endpoint) {
                this.selected = endpoint;
            },
            nextEndpoint() {
                this.setAuthenticatedEndpoint(JSON.stringify(this.selected));
                router.push({path: 'calls'});
            },
        }
    }
</script>

<style>

    #endpoints-wrapper {

    }

    #endpoints-wrapper #endpoints-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    #endpoints-wrapper #endpoints-list li {
        padding: 15px;
        position: relative;
        border-bottom: 1px solid #eee;
        border-radius: 3px;
        margin-bottom: 5px;
        margin-top: 5px;
        cursor: pointer;
    }

    #endpoints-wrapper #endpoints-list li .button {
        position: absolute;
        left: 15px;
        top: 7px;
    }

</style>