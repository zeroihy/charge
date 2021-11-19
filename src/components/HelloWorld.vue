<template>
</template>
<script>
    // import
    export default {
        name: "HelloWorld",
        data() {
            return {};
        },
        mounted() {
            this.controlType = this.getQueryString("controlType");
            if (this.controlType) {
                this.$router.push("/hotelPay");
            } else {
                this.$router.push("/chargeIndex");
            }
        },
        methods: {
            // 获取链接信息
            getQueryString(name) {
                let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                let r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            },
        },
    };
</script>
<style lang="less" scoped>
</style>
