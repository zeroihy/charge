
<template>
    <!-- https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx527d9308300170f5&redirect_uri=http%3A%2F%2Ftable.yunkuaichina.com%3FserialNumber%3D5202021080500005&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect -->
    <div class="charge" v-if="!$store.state.loading">
        <!-- 个人信息 -->
        <div class="user">
            <div class="icon">
                <img :src="imgSrc" />
            </div>
            <div class="middle" :style="remainTime?'':'background:white'">
                <p v-show="remainTime">剩余时间</p>
                <p v-show="remainTime">{{ remainTime }}</p>
            </div>
            <div class="right">
                <p>编号:{{ serialNumber }}</p>
                <p>联系电话:{{loginUser.clientConfig.serviceTel}}</p>
            </div>
        </div>
        <!-- 套餐 -->
        <div v-show="!curOrder">
            <div class="buttomImg">
                <div class="box"
                    v-for="(item, index) in loginUser.clientConfig.turntableConfigs"
                    :key="index" @click="start()">
                    <img src="../assets/automatic.png" />
                    <p class="price">{{item.time}}分钟{{item.price}}元</p>
                </div>
            </div>
        </div>
        <!-- 转盘操作 -->
        <div class="round" v-show="curOrder">
            <img class="roundButton" src="../assets/goOn.png" @click="goOn" />
            <img class="roundButton" src="../assets/endClick.png" @click="endClick" />
            <img class="roundButton" src="../assets/stop.png" @click="stop" />
        </div>
        <!-- 心愿 -->
        <div class="wish">
            <van-field label-width="95px" v-model="value" label="请输入祝福条文："
                placeholder="请输入内容" />
        </div>
        <van-button
            style="width: 90%; margin-left: 5%;margin-top:10px;border-radius:5px;background:#5087F0;color:#fff;height: 35px;"
            @click="wishPay()">
            {{wishPayText}}</van-button>
        <!-- 游戏 -->
        <van-cell-group title="喝酒游戏免费玩"> </van-cell-group>
        <div class="radio">
            <div v-for="(item, index) in gameList" :key="index" @click="gameClick(index)"
                :class="item.show? 'gameSelect':'gameInfo'">
                <div class="gameBox">
                    <img :src="item.img" />
                    <p>{{item.title}}</p>
                </div>
            </div>
        </div>
        <van-button
            style="width: 90%; margin-left: 5%;margin-top:10px;border-radius:5px;background:#5087F0;color:#fff;height: 35px;"
            @click="gameStart()">
            免费开始
        </van-button>
        <div @click="concern()" class="concernClass" v-show="!loginUser.subscribeTime">
            <!-- <div @click="concern()" class="concernClass"> -->
            点此关注公众号即可免费开始行酒令，如已关注，请重新扫码进入
        </div>
        <van-swipe height="110px" :show-indicators="false" :autoplay="3000" class="swipe">
            <van-swipe-item v-for="(image, index) in images" :key="index">
                <img :src="`${imgUrl}${image}`" class="swipeImg" />
            </van-swipe-item>
        </van-swipe>
        <van-dialog v-model="showImg" class="dialog" title="长按识别二维码"
            :show-confirm-button='false'>
            <van-icon name="cross" class="cross" @click="showImg=false" />
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
                images: [],
                imgUrl: "",
                curOrder: false,
                onType: 1,
                remainTime: null,
                timer: null,
                out_trade_no: null,
                clientConfig: {},
                showImg: false,
                wishPayText: "免费发送祝福",
            };
        },
        created() {
            this.serialNumber = this.getQueryString("serialNumber");
            this.code = this.getQueryString("code");
            this.$store.state.loading = false;
            this.imgUrl = process.env.BASE_API + "/user/";
            this.login();
            this.ad();
        },
        methods: {
            // 获取链接信息
            getQueryString(name) {
                let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                let r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            },
            ad() {
                this.$axios({
                    method: "get",
                    url: process.env.BASE_API + "/user/user/adimages",
                }).then((res) => {
                    this.images = res.data.result;
                    console.log(res);
                });
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
                                    img: this.imgUrl + `game-${index}.png`,
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
                    this.$toast.fail("请先选择行酒令");
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
                        this.$toast.success("行酒令启动成功");
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
                    console.log(res.data);
                    if (res.data.success) {
                        if (!res.data.result.out_trade_no) {
                            this.$toast.success("心愿发送成功");
                        } else {
                            this.weixinInit(res.data.result, 0);
                        }

                        //
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
                                            this.$toast.error(
                                                "未查询到相关订单，请重新扫码"
                                            );
                                            clearInterval(thTimes);
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
                        this.timer = setInterval(() => {
                            this.remainTime = this.formatSeconds(
                                --this.loginUser.curOrder.remainTime
                            );
                            if (this.loginUser.curOrder.remainTime == "0") {
                                this.curOrder = false;
                                this.loginUser.curOrder = {};
                                this.remainTime = null;
                                clearInterval(this.timer);
                            }
                        }, 1000);
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
                        // this.initCurOrder(res.data.result);
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
            height: 60px;
            display: flex;
            position: relative;
            .icon {
                width: 15%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                img {
                    width: 30px;
                    border-radius: 50%;
                }
            }
            .middle {
                width: 42.5%;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 10px;
                background: #b6cdef;
                color: #fff;
                flex-direction: column;
                margin-top: 15px;
            }
            .right {
                width: 38.5%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: flex-end;
                flex-direction: column;
                font-size: 10px;
                color: #474747;
            }
        }
        .buttomImg {
            width: 100%;
            height: 100px;
            display: flex;
            justify-content: center;
            align-items: center;
            .box {
                width: 312px;
                height: 87px;
                position: relative;
                img {
                    width: 100%;
                    height: 100%;
                }
                .price {
                    position: absolute;
                    right: 30px;
                    bottom: 12px;
                    font-size: 10px;
                    color: #fff;
                    letter-spacing: 2px;
                }
            }
        }
        .van-cell-group__title {
            color: #474747;
            font-size: 10px;
            line-height: 10px;
        }
        .round {
            width: 100%;
            height: 100px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            .roundButton {
                width: 86px;
                height: 86px;
            }
        }
        .wish {
            width: 100%;
            height: 58px;
            background: #f2f2f2;
            display: flex;
            align-items: center;
            justify-content: center;
            .van-cell {
                width: 80%;
                height: 30px;
                background: #dcdada;
                border-radius: 15px;
            }
            /deep/.van-field__label {
                font-size: 10px;
                line-height: 4vw;
                color: #747474;
            }
            /deep/.van-cell__value {
                font-size: 10px;
                line-height: 4vw;
            }
        }
        .radio {
            width: 100%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            background: #f2f2f2;
            height: 112px;
            .gameInfo,
            .gameSelect {
                width: 20%;
                height: 50px;
                .gameBox {
                    width: 85%;
                    height: 50px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    font-size: 10px;
                    margin: 0 auto;
                    img {
                        width: 8vw;
                    }
                    p {
                        margin-top: 3px;
                    }
                }
            }
            .gameSelect {
                .gameBox {
                    border: 1px solid rgb(80, 135, 240);
                    border-radius: 5px;
                }
            }
        }
        .swipe {
            position: absolute;
            bottom: 5px;
        }
        .swipeImg {
            width: 90%;
            height: 100px;
            margin: 10px auto;
            display: block;
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
    }
    .concernClass {
        width: 100%;
        text-align: center;
        font-size: 10px;
        height: 15px;
        line-height: 15px;
        color: rgb(238, 10, 36);
    }
    .dialog {
        display: flex;
        width: 80%;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        .cross {
            position: absolute;
            top: 10px;
            right: 10px;
        }
    }
</style>