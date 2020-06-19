<template>
    <div class="about">
        <Toolbar title="بیشتر" />

        <div id="menu-wrapper" class="wrapper">

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
            }
        },
        components: {BottomBar, Toolbar},
        created() {
            this.user = this.getAuthenticatedEndpoint();
        },
        methods: {
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
</style>