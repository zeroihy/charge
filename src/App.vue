<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script>
    export default {
        name: "App",
        data() {
            return {};
        },
        created() {
            this.$store.state.turntableId = this.getQueryString("turntableId");
            this.$store.state.code = this.getQueryString("code");
            this.login();
        },
        methods: {
            getQueryString(name) {
                let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                let r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            },
            login() {
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/login",
                    params: {
                        code: this.$store.state.code,
                    },
                }).then((res) => {
                    console.log(res);
                    if (res.data.success) {
                        this.$store.state.loginUser = res.data.result;
                        if (this.$store.state.loginUser.curOrder) {
                            this.$store.state.turntableId = this.$store.state.loginUser.curOrder.turntableId;
                        }
                        this.$store.state.id = this.$store.state.loginUser.id;
                    } else {
                        this.$toast.fail(res.data.message);
                    }
                });
            },
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
        background: rgb(247, 248, 250);
    }
    * {
        margin: 0;
        padding: 0;
    }

    canvas {
        display: block;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        width: 300px;
        height: 300px;
    }
</style>
