<template>
    <div class="home">
        <Toolbar title="تماس ها" :left-button="null" :right-button="null"/>
        <div id="home-wrapper" class="wrapper">
            <div class="container">
                <audio id="audio2" autoplay controls style="display: none"></audio>
                <ul v-if="calls && calls.length > 0" id="session-list" style="margin-top:20px;">
                    <li v-for="call in calls">
                        <div class="card">
                            <header class="card-header">
                                <div class="card-header-title">
                                <div class="columns is-mobile is-desktop is-tab">
                                    <label class="column is-one-quarter">تماس</label>
                                    <span class="column">{{call.id}}</span>
                                </div>
                                </div>
                            </header>
                            <div class="card-content">

                                <div class="columns is-mobile">
                                    <div class="column">
                                        <label class="text-muted">شناسه</label>
                                        <p class="">{{call.id}}</p>
                                    </div>
                                    <div class="column">
                                        <label class="text-muted">تماس گیرنده</label>
                                        <p class="">{{call.caller.username}} => ‌{{call.receptor.username}} </p>
                                    </div>
                                    <div class="column">
                                        <label class="text-muted">وضعیت</label>
                                        <p class="">
                                            <b-tag type="is-primary">
                                                {{call.status}}
                                            </b-tag>
                                        </p>
                                    </div>
                                    <div class="column">

                                    </div>
                                </div>


                            </div>
                            <div class="card-footer" style="padding:10px;">
                                <b-button type="is-success" expanded
                                          @click="joinCall(call.id,call.receptor.accessToken)">اتصال
                                </b-button>
                            </div>
                        </div>
                    </li>
                </ul>
                <div class="empty-box" style="text-align: center" v-else>
                    <b-icon
                            icon="alert-circle-outline"
                            size="is-medium">
                    </b-icon>
                    <h2 class="title is-4">
                        تماسی در صف وجود ندارد !
                    </h2>
                </div>

            </div>
        </div>

        <BottomBar/>
    </div>
</template>

<script>
    import httpClient from '../api'
    import router from "../router";
    import Toolbar from "../components/Toolbar";
    import BottomBar from "../components/BottomBar";

    export default {
        name: 'Home',
        components: {BottomBar, Toolbar},
        data() {
            return {
                calls: [],
                currentCall: null,
                receptor: "",
                isLoading: false,
                onBack: {
                    icon: 'arrow-right',
                    click: function () {

                    }
                }
            };
        },
        created() {
            this.checkNewCalls();
            this.intervalId = setInterval(this.checkNewCalls, 3000);
        },
        methods: {

            getAuthenticatedEndpoint() {
                return JSON.parse(localStorage.getItem("AuthenticatedEndpoint"));
            },
            checkNewCalls() {
                var self = this;
                httpClient.getSessions().then(response => {
                    self.calls = response.result;
                });
            },
            joinCall(callId, accessToken) {
                router.push({path: `/call/${callId}/${accessToken}`});
            }
        },
        beforeDestroy() {
            clearInterval(this.intervalId);
        }
    }
</script>
<style>

    #home-wrapper {

    }

    #home-wrapper .columns .column {
        text-align: right;
    }

    #home-wrapper .columns label {
        font-weight: bold;
    }

    #home-wrapper .empty-box {
        padding: 50px 0;
    }

    #home-wrapper .empty-box .icon {
        margin-top: 20px;
        color: #2196F3;
    }

    #home-wrapper .empty-box .title {
        margin-top: 20px;
        color: #4a5357;
    }

    #home-wrapper .call-card .card-body .ltr {
        background: #eee;
        padding: 8px;
        border-radius: 3px;
    }

    #home-wrapper .call-card .call-status {
        float: left !important;
        font-weight: normal;
        text-transform: uppercase;
        padding: 5px 7px;
    }

    #home-wrapper .content {
        margin: 80px 0;
        padding: 20px;
    }

    #home-wrapper #session-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    #home-wrapper #session-list li {
        padding: 10px;
    }

</style>