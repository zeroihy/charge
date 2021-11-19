<template>

</template>
<script>
    export default {
        data() {
            return {
                serialNumber: null,
                code: null,
                controlType: null,
                text: null,
                time: null,
            };
        },
        created() {
            this.serialNumber = this.getQueryString("numbers");
            this.code = this.getQueryString("code");
            this.controlType = this.getQueryString("controlType");
            this.time = this.getQueryString("time");
            this.text = this.getQueryString("text");
            this.$store.state.loading = false;
            console.log(window.location.href);

            this.login();
        },
        methods: {
            // 获取链接信息
            getQueryString(name) {
                let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                let r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            },
            // 登录
            login() {
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/login",
                    params: {
                        code: this.code,
                    },
                }).then((res) => {
                    console.log("登录的数据");
                    console.log(res);
                    if (res.data.success) {
                        this.loginUser = res.data.result;
                        let userId = this.loginUser.id;
                        this.start(userId);
                    }
                });
            },
            start(userId) {
                let data = {
                    controlType: this.controlType,
                    ids: this.serialNumber,
                    text: this.text,
                    time: this.time,
                    userId: userId,
                };
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/adminPay",
                    params: data,
                }).then((res) => {
                    console.log("启动" + res);
                    if (res.data.success) {
                        this.weixinInit(res.data.result, 1);
                    } else {
                        this.$toast.fail(res.data.message);
                    }
                });
            },
            // 判断是不是微信环境
            weixinInit(result, type) {
                let data = {
                    appId: this.$store.state.appId,
                    timeStamp: result.params.timeStamp,
                    nonceStr: result.params.nonceStr,
                    package: result.params.package,
                    signType: "MD5",
                    paySign: result.params.paySign,
                };
                if (typeof WeixinJSBridge === "undefined") {
                    // 微信浏览器内置对象。参考微信官方文档
                    if (document.addEventListener) {
                        document.addEventListener(
                            "WeixinJSBridgeReady",
                            this.onBridgeReady(data, type)
                        );
                    } else if (document.attachEvent) {
                        document.attachEvent(
                            "WeixinJSBridgeReady",
                            this.onBridgeReady(data, type)
                        );
                        document.attachEvent(
                            "onWeixinJSBridgeReady",
                            this.onBridgeReady(data, type)
                        );
                    }
                } else {
                    console.log("准备调用微信支付");
                    this.onBridgeReady(data, type);
                }
            },
            // 调用微信支付
            onBridgeReady(data) {
                console.log(data);
                WeixinJSBridge.invoke(
                    "getBrandWCPayRequest",
                    {
                        appId: data.appId,
                        timeStamp: data.timeStamp,
                        nonceStr: data.nonceStr,
                        package: data.package,
                        signType: data.signType,
                        paySign: data.paySign,
                        sign: data.paySign,
                    },
                    (res1) => {
                        console.log("支付后回执");
                        console.log(res1);
                    }
                );
            },
        },
    };
</script>