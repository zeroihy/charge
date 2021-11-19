<template>
    <div id="app">
        <router-view />
        <van-loading type="spinner" class="loading" color="#1989fa" size="30px"
            v-if="$store.state.loading">加载中...</van-loading>
    </div>
</template>

<script>
    export default {
        name: "App",
        data() {
            return {
                controlType: null,
            };
        },
    };
</script>

<style>
    body,
    html {
        width: 100%;
        height: 100%;
    }
    #app {
        width: 100%;
        height: 100%;
        background: #fff;
        position: relative;
    }
    * {
        margin: 0;
        padding: 0;
    }

    .loading {
        position: absolute;
        top: 40%;
        left: 45%;
    }
</style>
