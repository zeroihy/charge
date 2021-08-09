<template>
  <div class="charge">
    <!-- 1.读取到二维码中的设备唯一ID和经营商ID
2.通过设备唯一ID从后台查询到设备信息
3.通过经营商ID从后台查询到付费金额信息
4.将设备信息和付费金额信息显示到用户手机微信/支付宝的页面中 -->
    <div class="user">
      <div class="icon">
        <img src="@/assets/user.png" />
      </div>
      <div class="info">
        <p>编号：{{ numbering }}</p>
        <p>余额：{{ balance }}</p>
      </div>
      <div class="tel">客户电话：15350000559</div>
    </div>
    <van-cell-group title="请选择套餐"> </van-cell-group>
    <div class="radio">
      <div
        class="radioInfo"
        v-for="(item, index) in radioList"
        :key="index"
        @click="radioClick(index)"
      >
        <div class="left">
          <p>{{ item.mon }}</p>
          <p>{{ item.time }}</p>
        </div>
        <div class="right">
          {{ item.radioTitle }}
        </div>
        <van-icon
          name="success"
          color="#1daaf6"
          class="success"
          v-show="item.show"
        />
      </div>
    </div>
    <div class="toastMon">本次支付：{{ toastMon }}</div>
    <van-button type="info" style="width: 80%; margin-left: 10%" round>套餐支付</van-button>
    <van-cell-group title="请输入心语心愿"> </van-cell-group>
    <van-field v-model="value" label="心语心愿" />

    <div class="toastMon">本次支付：{{ toastMon }}</div>
    <van-button type="info" style="width: 80%; margin-left: 10%" round>心愿支付</van-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      numbering: "FB01789",
      balance: "1.5",
      active: 0,
      radioList: [
        {
          mon: "0.02元",
          time: "120分钟",
          radioTitle: "体验转盘",
          show: true,
        },
        {
          mon: "0.02元",
          time: "120分钟",
          radioTitle: "体验转盘1",
          show: false,
        },
        {
          mon: "0.02元",
          time: "120分钟",
          radioTitle: "体验转盘2",
          show: false,
        },
      ],
      toastMon: "0.02元",
    };
  },
  methods: {
    radioClick(index) {
      this.radioList.forEach((item, index1) => {
        if (index == index1) {
          item.show = true;
          this.toastMon = item.mon;
        } else {
          item.show = false;
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
}
</style>