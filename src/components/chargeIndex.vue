<template>
    <div class="charge" v-if="!$store.state.loading">
        <!-- 个人信息 -->
        <div class="user">
            <div class="icon">
                <img :src="imgSrc" />
            </div>
            <div class="info">
                <p>编号:{{ serialNumber }}</p>
                <!-- <p>{{}}</p> -->
                <p v-show="remainTime">剩余时间:{{ remainTime }}</p>

            </div>
            <div class="tel">客服电话:{{loginUser.clientConfig.serviceTel}}</div>
        </div>
        <!-- 套餐 -->
        <div v-show="!curOrder">
            <van-cell-group title="请选择套餐"> </van-cell-group>
            <div class="radio">
                <div class="radioInfo"
                    v-for="(item, index) in loginUser.clientConfig.turntableConfigs"
                    :key="index" @click="radioClick(index)">
                    <div class="left">
                        <p>{{ item.price }}元</p>
                        <p>{{ item.time }}分钟</p>
                    </div>
                    <div class="right">
                        {{ item.name }}
                    </div>
                    <van-icon name="success" color="#1daaf6" class="success"
                        v-show="item.show" />
                </div>
            </div>
            <div class="toastMon" v-show="toastMon&&!curOrder">本次支付：{{ toastMon }}元</div>
            <van-button type="info" style="width: 80%; margin-left: 10%" round
                v-show="!curOrder" @click="start()">
                套餐支付</van-button>
        </div>
        <!-- 转盘操作 -->
        <div class="round" v-show="curOrder">
            <div class="roundButton" @click="goOn">
                继续<br>旋转
            </div>
            <div class="roundButton" @click="endClick">
                中止<br>旋转
            </div>
            <div class="roundButton" @click="stop">
                暂停<br>旋转
            </div>
        </div>
        <!-- 心愿 -->
        <van-cell-group title="请输入心语心愿"> </van-cell-group>
        <van-field v-model="value" label="心语心愿" placeholder="请输入内容" />
        <div class="toastMon">本次支付：{{loginUser.clientConfig.textPrice}}元</div>
        <van-button type="info" style="width: 80%; margin-left: 10%" round
            @click="wishPay()">
            心愿支付</van-button>
        <!-- 游戏 -->
        <van-cell-group title="免费行酒令"> </van-cell-group>
        <div class="gameRadio">
            <div v-for="(item, index) in gameList" :key="index" @click="gameClick(index)"
                :class="item.show?'gameSInfo':'gameInfo'">
                <p>{{item.title}}</p>
                <van-icon name="success" color="#409eff" class="success"
                    v-show="item.show" />
            </div>
        </div>
        <van-button type="info" style="width: 80%; margin-left: 10%" round
            @click="gameStart()">
            免费开始游戏
        </van-button>
        <div @click="concern()" class="concernClass" v-show="!loginUser.subscribeTime">
            点此关注公众号即可免费开始游戏，如已关注，请重新扫码进入</div>
        <van-dialog v-model="showImg" class="dialog" title="长按识别二维码" show-confirm-button>
            <img src="../assets/logoImg.jpg" />
        </van-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                balance: null,
                imgSrc: "",
                active: 0,
                gameList: [],
                value: null,
                toastMon: "",
                gameIndex: "",
                serialNumber: null,
                code: null,
                loginUser: {
                    clientConfig: {},
                },
                curOrder: false,
                onType: 1,
                remainTime: null,
                timer: null,
                out_trade_no: null,
                clientConfig: {},
                showImg: false,
            };
        },
        created() {
            this.serialNumber = this.getQueryString("serialNumber");
            this.code = this.getQueryString("code");
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
                        serialNumber: this.serialNumber,
                    },
                }).then((res) => {
                    console.log("登录的数据");
                    console.log(res);
                    if (res.data.success) {
                        this.loginUser = res.data.result;
                        this.imgSrc = this.loginUser.iconUrl;
                        this.userId = this.loginUser.id;
                        this.loginUser.clientConfig.turntableConfigs.forEach(
                            (item, index) => {
                                item.show = false;
                            }
                        );
                        this.gameList = [];
                        this.loginUser.clientConfig.gameNames.forEach(
                            (item, index) => {
                                this.gameList.push({
                                    title: item,
                                    show: false,
                                    gameIndex: index,
                                });
                            }
                        );
                        this.$store.state.loading = false;
                        this.initCurOrder(this.loginUser.curOrder);
                    } else {
                        this.$toast.fail(res.data.message);
                    }
                });
            },
            // 秒转成时分秒
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
                if (h !== "00") res += `${h}小时`;
                if (m !== "00") res += `${m}分钟`;
                res += `${s}秒`;
                return res;
            },
            // 选择套餐
            radioClick(index) {
                this.loginUser.clientConfig.turntableConfigs.forEach(
                    (item, index1) => {
                        if (index == index1) {
                            item.show = true;
                            this.toastMon = item.price;
                            this.onType = item.type;
                        } else {
                            item.show = false;
                        }
                    }
                );
            },
            // 选择游戏
            gameClick(index) {
                this.gameList.forEach((item, index1) => {
                    if (index == index1) {
                        item.show = true;
                        this.gameIndex = item.gameIndex;
                    } else {
                        item.show = false;
                    }
                });
            },
            // 开始游戏
            gameStart() {
                if (!this.loginUser.subscribeTime) {
                    this.$dialog
                        .alert({
                            message: "请先扫码关注公众号，如已关注，请重新扫码进入",
                        })
                        .then(() => {
                            this.showImg = true;
                        });
                    return;
                }
                console.log(this.gameIndex);
                if (this.gameIndex === "") {
                    this.$toast.fail("请先选择游戏");
                    return;
                }
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/game",
                    params: {
                        gameIndex: this.gameIndex,
                        serialNumber: this.serialNumber,
                        userId: this.userId,
                    },
                }).then((res) => {
                    console.log(res);
                    if (res.data.success) {
                        this.$toast.success("游戏启动成功");
                        let result = res.result;
                    } else {
                        this.$toast.fail(res.data.message);
                    }
                });
            },
            // 心愿支付
            wishPay() {
                if (this.value == "") {
                    this.$toast.fail("心愿内容不能为空");
                    return;
                }
                let params = {
                    code: this.code,
                    serialNumber: this.serialNumber,
                    text: this.value,
                    userId: this.userId,
                };
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/text",
                    params: params,
                }).then((res) => {
                    console.log(res);
                    if (res.data.success) {
                        this.weixinInit(res.data.result, 0);
                        // this.$toast.success("心愿发送完成");
                    } else {
                        // console.log(res.message);
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
                            this.onBridgeReady(data, type),
                            false
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
            // 启动转盘
            start() {
                if (this.onType === "") {
                    this.$toast.fail("请先选择套餐");
                    return;
                }
                let params = {
                    serialNumber: this.serialNumber,
                    type: this.onType,
                    userId: this.userId,
                };
                console.log(params);
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/turn",
                    params: params,
                }).then((res) => {
                    console.log("启动" + res);
                    console.log(res.data);
                    if (res.data.success) {
                        //
                        this.out_trade_no = res.data.result.out_trade_no;
                        this.weixinInit(res.data.result, 1);
                    } else {
                        this.$toast.fail(res.data.message);
                    }
                });
            },
            // 调用微信支付
            onBridgeReady(data, rType) {
                console.log(data);
                console.log(rType);
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
                        if (rType == 1) {
                            let count = 0;
                            let thTimes = setInterval(() => {
                                this.$axios({
                                    method: "get",
                                    url:
                                        process.env.BASE_API +
                                        "/user/user/payresult",
                                    params: {
                                        orderNo: this.out_trade_no,
                                    },
                                }).then((res) => {
                                    console.log("延迟后" + count);
                                    console.log(res);
                                    //
                                    if (res.data.success) {
                                        if (count < 3) {
                                            if (!res.data.result) {
                                                count++;
                                            } else {
                                                clearInterval(thTimes);
                                                this.$toast.success("转盘启动成功");
                                                this.initCurOrder(res.data.result);
                                            }
                                        } else {
                                            this.$toast.success(
                                                "未查询到相关订单，请重新扫码"
                                            );
                                            clearInterval(this.thTimes);
                                        }
                                    }
                                });
                            }, 1000);
                        }
                    }
                );
            },
            // 停止转盘
            stop() {
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/stop",
                    params: {
                        userId: this.userId,
                        serialNumber: this.serialNumber,
                    },
                }).then((res) => {
                    console.log("暂停" + res);
                    clearInterval(this.timer);
                    this.$toast.success("转盘已暂停");
                });
            },
            // 获取转盘转动数据
            initCurOrder(data) {
                this.loginUser.curOrder = data;
                if (this.loginUser.curOrder) {
                    if (this.loginUser.curOrder.remainTime > 0) {
                        this.curOrder = true;
                        this.out_trade_no = this.loginUser.curOrder.orderNo;
                        this.balance = this.loginUser.curOrder.money;
                        this.remainTime = this.formatSeconds(
                            this.loginUser.curOrder.remainTime
                        );
                        if (!this.loginUser.curOrder.suspendTime) {
                            this.timer = setInterval(() => {
                                this.remainTime = this.formatSeconds(
                                    --this.loginUser.curOrder.remainTime
                                );
                            }, 1000);
                        }
                    }
                }
            },
            // 转盘继续
            goOn() {
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/run",
                    params: {
                        userId: this.userId,
                        serialNumber: this.serialNumber,
                    },
                }).then((res) => {
                    console.log("继续" + res);
                    if (res.data.success) {
                        this.initCurOrder(res.data.result);
                        this.$toast.success("转盘继续旋转");
                    }
                });
            },
            // 结束转盘
            endClick() {
                this.$dialog
                    .confirm({
                        message: "确定终止旋转吗？",
                    })
                    .then(() => {
                        this.$axios({
                            method: "get",
                            url: process.env.BASE_API + "/user/user/finish",
                            params: {
                                userId: this.userId,
                                serialNumber: this.serialNumber,
                            },
                        }).then((res) => {
                            console.log("继续" + res);
                            if (res.data.success) {
                                this.curOrder = false;
                                clearInterval(this.timer);
                                this.loginUser.curOrder = {};
                                this.remainTime = null;
                            }
                        });
                    });
            },
            concern() {
                this.showImg = true;
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
                    border-radius: 50%;
                }
            }
            .info {
                width: 70%;
                height: 90%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                flex-direction: column;
                font-size: 12px;
                p {
                    width: 80%;
                }
            }
            .tel {
                position: absolute;
                bottom: 5px;
                right: 10px;
                color: #fff;
                font-size: 10px;
            }
        }
        .gameRadio {
            width: 100%;
            margin: 0 auto;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
            overflow-x: scroll;
            .gameInfo {
                width: 30%;
                border: 1px solid rgb(218, 222, 224);
                height: 50px;
                display: flex;
                margin-top: 10px;
                margin-left: 4%;
                border-radius: 5px;
                background: #fff;
                position: relative;
                flex-shrink: 0;
                p {
                    width: 100%;
                    height: 100%;
                    line-height: 50px;
                    text-align: center;
                }
            }
            .gameSInfo {
                width: 30%;
                height: 50px;
                display: flex;
                margin-top: 10px;
                margin-left: 4%;
                border-radius: 5px;
                // background: #409eff;
                border: 1px solid #409eff;
                background: #fff;
                position: relative;
                flex-shrink: 0;
                .success {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                }
                p {
                    width: 100%;
                    height: 100%;
                    line-height: 50px;
                    text-align: center;
                }
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
            font-size: 3.8vw;
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
                // border: 2px solid rgb(85, 170, 143);
                box-shadow: 5px 5px 5px rgb(85, 170, 143);
                color: rgb(230, 155, 3);
            }
        }
    }
    .concernClass {
        width: 100%;
        text-align: center;
        font-size: 12px;
        color: rgb(238, 10, 36);
    }
    .dialog {
        display: flex;
        width: 80%;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
</style>