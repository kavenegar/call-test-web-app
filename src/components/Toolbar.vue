<template>
    <div id="toolbar" class="">
        <div class="container">
            <div class="columns is-mobile">
                <div class="column">
                    <b-button v-if="rightButton" type="is-info" :icon-left="rightButton.icon" @click="rightButton.click">
                    </b-button>
                </div>
                <h1 class="column is-three-fifths">{{this.title}}</h1>
                <div class="column">
                    <b-button v-if="leftButton" type="is-danger" :icon-left="leftButton.icon" @click="leftButton.click">
                    </b-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>


    export default {
        name: 'toolbar',
        props: {
            title: {
                type: String,
                default: "No Title"
            },
            leftButton: {
                type: Object,
                default: null
            },
            rightButton: {
                type: Object,
                default: null
            }
        }, methods: {}
    }
</script>


<style>

    #toolbar {
        background: #1d4051;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding-top: 15px;
        padding-bottom: 15px;
        font-size: 25px;
        color: #fff;
        box-shadow: 0 1px 2px rgba(30, 65, 81, 0.37);
        z-index: 99999;
    }

    #toolbar h1 {
        font-weight: bold;
    }

    #toolbar .column {
        text-align: center;
    }

</style>