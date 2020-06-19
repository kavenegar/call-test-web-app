<template>
    <div id="bottom-bar" class="">
        <div class="container">
            <div class="columns is-mobile">
                <div class="column">
                    <router-link to="/" class="">
                        <b-icon
                                icon="phone-log"
                                custom-size="mdi-24px">
                        </b-icon>
                        تماس ها
                    </router-link>
                </div>

                <div class="column">
                    <router-link to="/endpoints" class="">
                        <b-icon
                                icon="account-multiple"
                                custom-size="mdi-24px">
                        </b-icon>
                        مخاطبین
                    </router-link>
                </div>
                <div class="column">
                    <router-link to="/profile" class="">
                        <b-icon
                                icon="account-circle"
                                custom-size="mdi-24px">
                        </b-icon>
                        پروفایل
                    </router-link>
                </div>

                <div class="column">
                    <router-link to="/menu" class="">
                        <b-icon
                                icon="menu"
                                custom-size="mdi-24px">
                        </b-icon>
                        بیشتر
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>


<script>

    export default {
        name: 'bottom-bar',
        components: {}
    }
</script>


<style>

    /*    #bottom-bar {*/
    /*        position: fixed;*/
    /*        bottom: 0;*/
    /*        font-size: 17px;*/
    /*        left: 0;*/
    /*        right: 0;*/
    /*        background: #fff;*/
    /*        color: #273d53;*/
    /*        text-align: center;*/
    /*        box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.07);*/

    /*    }*/

    /*    #bottom-bar .col {*/
    /*        padding: 0;*/
    /*        margin: 0;*/
    /*    }*/

    /*    #bottom-bar a {*/
    /*        display: block;*/
    /*        padding: 10px 0;*/
    /*        cursor: pointer;*/
    /*        color: #343a40;*/
    /*        text-decoration: none;*/
    /*        line-height: 1.3em;*/
    /*    }*/

    /*    #bottom-bar a:hover {*/
    /*        color: #167df0;*/
    /*    }*/

    /*    #bottom-bar .row {*/
    /*        margin-bottom: 0;*/
    /*    }*/

    /*    #bottom-bar ul {*/
    /*        padding: 0;*/
    /*        list-style: none;*/
    /*    }*/

    /*    #bottom-bar li span {*/
    /*        display: block;*/
    /*        white-space: nowrap;*/
    /*    }*/

    /*    #bottom-bar li .router-link-exact-active {*/
    /*        color: #167df0;*/
    /*    }*/


    #bottom-bar {
        background: #fff;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding-top: 15px;
        padding-bottom: 15px;
        font-size: 17px;
        color: #fff;
        box-shadow: 0 0px 2px rgba(101, 101, 101, 0.45);
        z-index: 99999;
    }

    #bottom-bar .column {
        padding-top: 5px;
    }

    #bottom-bar a {
        display: block;
        text-align: center;
        color: #555;
        font-weight: 600;
    }

    #bottom-bar a span {
        display: block;
        margin: 10px auto;
        margin-top: 0;
    }

    #bottom-bar .router-link-exact-active {
        color: #167df0;
    }

</style>