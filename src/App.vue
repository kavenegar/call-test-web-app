<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<style>
    @import '~buefy/dist/buefy.css';

    body {
        font-family: 'Sahel', sans-serif;
        direction: rtl;
        text-align: right;
    }

    button {
        font-family: 'Sahel', sans-serif;
    }

    #app {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .wrapper {
        padding: 70px 0;
    }

    .ltr {
        text-align: left;
        direction: ltr;
    }
</style>
