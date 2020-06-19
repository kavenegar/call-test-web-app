<template>
    <div class="about">
        <Toolbar title="پروفایل کاربری" :left-button="signoutButton" :right-button="selectEndpointButton"/>

        <div id="profile-wrapper" class="wrapper" v-if="user">

            <label>نام کاربری</label>
            <p class="ltr">{{user.username}}</p>

            <div v-if="user.displayName">
                <label>نام قابل مشاهده</label>
                <p class="ltr">{{user.displayName}}</p>
            </div>

            <label>شناسه دسترسی</label>
            <p class="ltr">{{user.accessToken}}</p>

            <label>وضعیت</label>
            <p class="ltr">{{user.status.toUpperCase()}}</p>


            <label>برچسب ها</label>
            <p class="ltr">{{user.tags}}</p>


        </div>

        <BottomBar/>
    </div>
</template>
<script>
    import Toolbar from "../components/Toolbar";
    import BottomBar from "../components/BottomBar";
    import router from "../router";

    export default {
        data() {
            return {
                user: null,
                signoutButton: {
                    icon: 'exit-to-app',
                    click: this.signOut
                },
                selectEndpointButton: {
                    icon: 'account-search',
                    click: this.selectEndpoint
                }
            }
        },
        components: {BottomBar, Toolbar},
        created() {
            this.user = this.getAuthenticatedEndpoint();
        },
        methods: {
            selectEndpoint(){
                localStorage.removeItem("AuthenticatedEndpoint");
                router.push({path: '/login'});
            },
            signOut() {
                localStorage.removeItem("AuthenticatedEndpoint");
                localStorage.removeItem("ApplicationToken");
                router.push({path: '/authorize'});
            },
            getAuthenticatedEndpoint() {
                return JSON.parse(localStorage.getItem("AuthenticatedEndpoint"));
            }
        }
    }
</script>
<style>
    #profile-wrapper label {
        font-weight: bold;
        font-size: 19px;
        margin-top: 20px;
        display: block;
    }

    #profile-wrapper {
        padding-right: 20px;
        padding-left: 20px;
    }

    #profile-wrapper .ltr {
        background: #f1f1f1;
        padding: 10px;
        border-radius: 3px;
        margin-top: 10px;
    }
</style>