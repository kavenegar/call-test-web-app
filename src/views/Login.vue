<template>
    <div class="home">
        <Toolbar title="ورود به آوانگار"/>

        <div id="login-wrapper" class="wrapper">
            <div class="container">
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">
                            لیست کاربران
                        </p>
                    </header>
                    <div class="card-content">
                        <ul style="list-style: none" id="endpoints-list">
                            <li v-for="endpoint in this.endpoints" @click="selectEndpoint(endpoint)"
                                :class="selected != null && endpoint.id == selected.id ? 'selected' : ''">
                                {{endpoint.username}}
                            </li>
                        </ul>
                    </div>
                    <div class="card-footer" style="padding:10px;">
                        <b-button type="is-primary" expanded @click="this.nextEndpoint">انتخاب</b-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import httpClient from '../api'
    import router from "../router";
    import Toolbar from "../components/Toolbar";

    export default {
        name: 'Login',
        components: {Toolbar},
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
                router.push({path: '/'});
            },
        }
    }
</script>
<style>
    #login-wrapper #endpoints-list li {
        padding: 10px;
        border: 1px solid #eee;
        margin-bottom: 10px;
        border-radius: 3px;
        cursor: pointer;
    }

    #login-wrapper #endpoints-list li.selected {
        background: #dae2e9;
        border: none;
    }
</style>