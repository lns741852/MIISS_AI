<template>
  <div class="RetrievePW">
    <img src="img/BG/logo.png" height="13%" width="auto" />

    <div class="listborder EditProfile_listborder RetrievePW_listborder">
      <div style="width: 50%" class="forget_pass_lay1">
        <div class="listborder_title" style="margin-bottom: 1rem">
          <img src="/img/icon/forget_pass.png" alt="" style="width: 5rem" />
        </div>
        <div class="listborder_title" style="margin-bottom: 1rem">忘 記 密 碼</div>
        <p style="font-size: 0.9rem; margin-bottom: 2rem; color: #88e4fc">
          請撥打以下電話，我們會盡快協助您。
        </p>
        <p style="font-size: 1.1rem; margin-bottom: 5rem; color: #88e4fc">
          <span style="margin-right: 2rem">0938-593060</span>系統管理者
        </p>
        <!-- <div class="input_div">
          <label class="input_label">
            帳號：

          </label>
          <input type="text"  >

        </div>
          <div class="input_div" style="margin-bottom:6rem;">
          <label class="input_label">
            電子郵件：
          </label>
          <input type="email">

        </div> -->

        <div class="input_div">
          <!-- <button  class="btn_bg_boder" @click="forget_pass_send">
            確認</button> -->
          <button
            class="btn_bg_boder"
            @click="toLogin"
            style="background-image: url(/img/icon/btn_boder2.png)"
          >
            返回
          </button>
          <br />
        </div>
      </div>
      <!-- <div style="width: 55%" class="forget_pass_lay2">
        <div class="listborder_title" style="margin-bottom: 1rem">
          <img src="/img/icon/forget_pass_ok.png" alt="" style="width: 5rem" />
        </div>
        <div class="listborder_title" style="margin-bottom: 1rem">
          已傳送重置密碼的電子郵件
        </div>
        <p style="font-size: 0.7rem; margin-bottom: 6rem">
          已將電子郵件傳送至●●●●●●●●●●@●●●●.●●●.com 請依照電子郵件中的指示重置密碼。
        </p>

        <div class="input_div">
          <button class="btn_bg_boder" @click="toLogin">返回</button>
          <br />
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
export default {
  name: "RetrievePW",
  components: {},
  data() {
    return {};
  },
  computed: {},
  mounted() {},
  methods: {
    //回登入頁面
    toLogin() {
      this.$router.push("/login");
    },
    // forget_pass_send() {
    //   $('.forget_pass_lay1').hide();
    //   $('.forget_pass_lay2').show();
    // },
  },
};
</script>

<style scoped>
@import "../../assets/css/base.css";
@import "../../assets/css/font.css";
@import "../../assets/css/profile.css";
</style>
