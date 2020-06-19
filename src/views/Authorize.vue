<template>
    <div class="login">
        <div class="container">
            <div class="columns">
                <section class="column">
                    <img style="max-width:100px;margin-top:100px;" src="https://kavenegar.com/images/logo.svg"/>
                    <h1 class="title is-3">تماس اینترنتی آوانگار</h1>

                </section>
            </div>
            <div id="login-box">
                <h3 class="title is-5">ورود به سامانه</h3>
                <hr/>
                <b-field label="شناسه اپلیکیشن">
                    <b-input class="ltr" type="textarea" v-model="applicationToken"></b-input>
                </b-field>
                <b-button type="is-primary" expanded @click="saveApplication">ورود</b-button>
            </div>
        </div>
    </div>
</template>

<script>
    import httpClient from '../api';
    import router from "../router";
    // eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJNeURldkFwcCIsInJvbGVzIjoidXNlciIsInVzZXJJZCI6MTM4NzQsImFwcGxpY2F0aW9uSWQiOjUzNiwiZXhwIjoxNjQzNzk2MzMxfQ.N0gyY2-hsWiV9zIVGvn_0jd8Ls-HzEtyuunI_bQ4z-U
    export default {
        name: 'Authorize',
        data() {
            return {
                applicationToken: null
            }
        },
        components: {},
        methods: {
            saveApplication() {
                localStorage.setItem("ApplicationToken", this.applicationToken);
                httpClient.getEndpoints().then(response => {
                    router.push({path: '/login'});
                }).catch(error => {
                    localStorage.removeItem("ApplicationToken");
                    alert(error);
                });
            }
        }
    }
</script>
<style>
    .login {
        text-align: center;
    }

    #login-box {
        padding: 20px;
        text-align: right;
        margin: 0;
        background: #f9f9f9;
        border-top: 1px solid #eee;
    }
</style>