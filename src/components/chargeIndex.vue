<template>
    <div class="charge">
        <!-- 1.读取到二维码中的设备唯一ID和经营商ID
2.通过设备唯一ID从后台查询到设备信息
3.通过经营商ID从后台查询到付费金额信息
4.将设备信息和付费金额信息显示到用户手机微信/支付宝的页面中 -->
        <div class="user">
            <div class="icon">
                <img :src="imgSrc" />
            </div>
            <div class="info">
                <p>编号：{{ $store.state.turntableId }}</p>
                <p v-show="balance">消费总金额：{{ balance }}</p>
                <p v-show="remainTime">剩余时间：{{ remainTime }}</p>
            </div>
            <div class="tel">客户电话：15350000559</div>
        </div>
        <van-cell-group title="请选择套餐"> </van-cell-group>
        <div class="radio">
            <div class="radioInfo" v-for="(item, index) in radioList" :key="index"
                @click="radioClick(index)">
                <div class="left">
                    <p>{{ item.mon }}</p>
                    <p>{{ item.time }}</p>
                </div>
                <div class="right">
                    {{ item.radioTitle }}
                </div>
                <van-icon name="success" color="#1daaf6" class="success"
                    v-show="item.show" />
            </div>
        </div>
        <div class="toastMon">本次支付：{{ toastMon }}</div>
        <van-button type="info" style="width: 80%; margin-left: 10%" round
            @click="start()">
            套餐支付</van-button>
        <van-cell-group title="请输入心语心愿"> </van-cell-group>
        <van-field v-model="value" label="心语心愿" placeholder="请输入内容" />

        <div class="toastMon">本次支付：0.02元</div>
        <van-button type="info" style="width: 80%; margin-left: 10%" round
            @click="wishPay()">
            心愿支付</van-button>
        <div class="round">
            <!-- <div class="roundButton" v-show="!curOrder" @click="start">
                启动<br>转盘
            </div> -->
            <div class="roundButton" v-show="curOrder" @click="goOn">
                继续<br>旋转
            </div>
            <div class="roundButton" v-show="curOrder" @click="stop">
                暂停<br>旋转
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                balance: null,
                imgSrc: require("@/assets/user.png"),
                active: 0,
                radioList: [
                    {
                        mon: "0.1元",
                        time: "60分钟",
                        radioTitle: "体验转盘",
                        type: 1,
                        show: true,
                    },
                    {
                        mon: "0.2元",
                        time: "120分钟",
                        radioTitle: "体验转盘1",
                        type: 2,
                        show: false,
                    },
                ],
                value: null,
                toastMon: "0.2元",
                turntableId: null,
                code: null,
                text: "微信推送的文本",
                loginUser: null,
                curOrder: false,
                onType: 1,
                remainTime: null,
                timer: null,
                out_trade_no: null,
            };
        },
        created() {
            this.loginUser = this.$store.state.loginUser;
            if (this.loginUser.curOrder) {
                if (this.loginUser.curOrder.remainTime > 0) {
                    this.curOrder = true;
                    this.out_trade_no = this.loginUser.curOrder.orderNo;
                    this.balance = this.loginUser.money;
                    this.remainTime = this.formatSeconds(
                        this.loginUser.curOrder.remainTime
                    );
                    if (this.loginUser.curOrder.suspendTime) {
                        this.timer = setInterval(() => {
                            this.remainTime = this.formatSeconds(
                                this.loginUser.curOrder.remainTime--
                            );
                        }, 1000);
                    }
                }
            }
        },
        methods: {
            formatSeconds(value) {
                let result = parseInt(value);
                let h =
                    Math.floor(result / 3600) < 10
                        ? "0" + Math.floor(result / 3600)
                        : Math.floor(result / 3600);
                let m =
                    Math.floor((result / 60) % 60) < 10
                        ? "0" + Math.floor((result / 60) % 60)
                        : Math.floor((result / 60) % 60);
                let s =
                    Math.floor(result % 60) < 10
                        ? "0" + Math.floor(result % 60)
                        : Math.floor(result % 60);

                let res = "";
                if (h !== "00") res += `${h}h`;
                if (m !== "00") res += `${m}min`;
                res += `${s}s`;
                return res;
            },
            packagePay() {
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/turn",
                    params: {
                        code: this.$store.state.code,
                        turntableId: this.$store.state.turntableId,
                        type: this.onType,
                    },
                }).then((res) => {
                    console.log(res);
                    if (res.data.success) {
                        let result = res.result;
                    } else {
                        this.$toast.fail(res.data.message);
                    }
                });
            },
            radioClick(index) {
                this.radioList.forEach((item, index1) => {
                    if (index == index1) {
                        item.show = true;
                        this.toastMon = item.mon;
                        this.onType = item.type;
                    } else {
                        item.show = false;
                    }
                });
            },
            wishPay() {
                if (this.value == "") {
                    this.$toast.fail("心愿内容不能为空");
                    return;
                }
                let params = {
                    code: this.$store.state.code,
                    turntableId: this.$store.state.turntableId,
                    text: this.$store.state.text,
                    userId: this.$store.state.id,
                };
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/text",
                    params: params,
                }).then((res) => {
                    console.log(res);
                    if (res.data.success) {
                        let result = res.data.result;
                        // this.$toast.success("心愿发送完成");
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
                                    this.onBridgeReady(data),
                                    false
                                );
                            } else if (document.attachEvent) {
                                document.attachEvent(
                                    "WeixinJSBridgeReady",
                                    this.onBridgeReady(data)
                                );
                                document.attachEvent(
                                    "onWeixinJSBridgeReady",
                                    this.onBridgeReady(data)
                                );
                            }
                        } else {
                            console.log("准备调用微信支付");
                            this.onBridgeReady(data);
                        }
                    } else {
                        // console.log(res.message);
                        this.$toast.fail(res.data.message);
                    }
                });
            },
            onBridgeReady(data, rType) {
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
                    (res) => {
                        if (rType == 1) {
                            setTimeout(() => {
                                this.$axios({
                                    method: "get",
                                    url:
                                        process.env.BASE_API +
                                        "/user/user/payresult",
                                    params: {
                                        orderNo: this.out_trade_no,
                                    },
                                }).then((res) => {
                                    if (res.data.success) {
                                        this.loginUser.curOrder = res.data.result;
                                        if (this.loginUser.curOrder) {
                                            if (
                                                this.loginUser.curOrder.remainTime >
                                                0
                                            ) {
                                                this.curOrder = true;
                                                this.out_trade_no = this.loginUser.curOrder.orderNo;
                                                this.balance = this.loginUser.money;
                                                this.remainTime = this.formatSeconds(
                                                    this.loginUser.curOrder
                                                        .remainTime
                                                );
                                                this.timer = setInterval(() => {
                                                    this.remainTime = this.formatSeconds(
                                                        this.loginUser.curOrder
                                                            .remainTime--
                                                    );
                                                }, 1000);
                                            }
                                        }
                                    }
                                });
                            }, 3000);
                            console.log(res);
                        }
                    }
                );
            },
            start() {
                let params = {
                    turntableId: this.$store.state.turntableId,
                    type: this.onType,
                    userId: this.$store.state.id,
                };
                console.log(params);
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/turn",
                    params: params,
                }).then((res) => {
                    console.log("启动" + res);
                    if (res.data.success) {
                        // this.=  out_trade_no
                        this.$toast.success("转盘启动成功");
                        let result = res.data.result;
                        this.out_trade_no = result.out_trade_no;
                        console.log(this.out_trade_no);
                        // this.packagePay();
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
                                    this.onBridgeReady(data, 1),
                                    false
                                );
                            } else if (document.attachEvent) {
                                document.attachEvent(
                                    "WeixinJSBridgeReady",
                                    this.onBridgeReady(data, 1)
                                );
                                document.attachEvent(
                                    "onWeixinJSBridgeReady",
                                    this.onBridgeReady(data, 1)
                                );
                            }
                        } else {
                            console.log("准备调用微信支付");
                            this.onBridgeReady(data, 1);
                        }
                    }
                });
            },
            stop() {
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/stop",
                    params: {
                        userId: this.$store.state.id,
                    },
                }).then((res) => {
                    console.log("暂停" + res);
                    if (res.data.success) {
                        clearInterval(this.timer);
                        this.$toast.success("转盘已暂停");
                    }
                });
            },
            goOn() {
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/run",
                    params: {
                        userId: this.$store.state.id,
                    },
                }).then((res) => {
                    console.log("继续" + res);
                    if (res.data.success) {
                        this.loginUser.curOrder = res.data.result;
                        if (this.loginUser.curOrder) {
                            if (this.loginUser.curOrder.remainTime > 0) {
                                this.curOrder = true;
                                this.out_trade_no = this.loginUser.curOrder.orderNo;
                                this.balance = this.loginUser.money;
                                this.remainTime = this.formatSeconds(
                                    this.loginUser.curOrder.remainTime
                                );
                                this.timer = setInterval(() => {
                                    this.remainTime = this.formatSeconds(
                                        this.loginUser.curOrder.remainTime--
                                    );
                                }, 1000);
                            }
                        }
                        this.$toast.success("转盘继续旋转");
                    }
                });
            },
        },
    };
</script>

<style lang="less" scoped>
    .charge {
        width: 100%;
        height: 100%;
        .user {
            width: 100%;
            height: 80px;
            display: flex;
            background-image: linear-gradient(#1daaf6, #635cfc);
            position: relative;
            .icon {
                width: 30%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                    width: 50px;
                }
            }
            .info {
                width: 70%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                flex-direction: column;
                font-size: 14px;
                p {
                    width: 80%;
                }
            }
            .tel {
                position: absolute;
                bottom: 5px;
                right: 10px;
                color: #fff;
                font-size: 12px;
            }
        }
        .radio {
            width: 100%;
            margin: 0 auto;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            .radioInfo {
                width: 40%;
                border: 1px solid rgb(218, 222, 224);
                height: 50px;
                display: flex;
                margin-top: 10px;
                margin-left: 6.67%;
                position: relative;
                border-radius: 5px;
                background: #fff;
                .left {
                    width: 40%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    color: rgb(64, 151, 248);
                    font-size: 14px;
                    border-right: 1px solid rgb(64, 151, 248);
                    height: 100%;
                }
                .right {
                    width: 60%;
                    display: flex;
                    height: 100%;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }
                .success {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                }
            }
        }
        .toastMon {
            width: 100%;
            height: 20px;
            line-height: 20px;
            font-size: 18px;
            text-align: center;
            margin: 10px auto;
        }
        .wxToast {
            width: 80%;
            margin: 5px auto;
            height: 15px;
            line-height: 15px;
            font-size: 10px;
            color: rgb(238, 10, 36);
        }
        .round {
            width: 100%;
            height: 50px;
            // background: red;
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-top: 30px;
            .roundButton {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                border: 2px solid rgb(238, 10, 36);
            }
        }
    }
</style>