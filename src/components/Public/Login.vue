<template>
  <div class="Login">
    <div class="loginimg">
      <img src="img/BG/logo.png" height="25%" width="auto" />
    </div>
    <fieldset class="loginBG">
      <legend><img src="img/icon/user.png" height="66%" width="66%" /></legend>
      <form
        name="form"
        @submit.prevent="handleLogin"
        class="loginForm"
        style="display: inline-block"
      >
        <div class="form-group">
          <h2 style="font-size: 2rem">{{ message }}</h2>
        </div>
        <div class="inputgroup">
          <div class="inputBGimg">
            <input
              v-model="user.account"
              v-validate="'required'"
              type="text"
              class=" "
              name="account"
              placeholder="帳號"
              required
            />
          </div>

          <div class="inputBGimg">
            <input
              v-model="user.password"
              v-validate="'required'"
              type="password"
              class=" "
              name="password"
              placeholder="密碼"
              required
            />
          </div>
          <button class="btn login_btn" :disabled="loading">
            <span v-show="loading" class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </form>
      <div class="retrievepw" @click.prevent="toRetrievePW">忘記密碼</div>
    </fieldset>
    <div class="systext">數位病理玻片瀏覽暨標註系統</div>
    <div class="leave">
      <input
        @click.prevent="leaveSystem"
        type="button"
        class="leavebutton"
        title="離開系統"
      />
    </div>
  </div>
</template>

<script>
import User from "../../models/user";

export default {
  name: "Login",
  data() {
    return {
      user: new User("", ""),
      loading: false,
      message: "歡迎使用本系統",
    };
  },
  computed: {
    //登入狀態檢查
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
  },
  created() {
    //路由導向:如果以登入則自動跳轉至清單頁面
    if (this.loggedIn) {
      this.$router.push("/relay");
    }
  },
  methods: {
    //忘記密碼
    toRetrievePW() {
      this.$router.push("/retrievepw");
    },
    //登入
    handleLogin() {
      this.loading = true;
      this.$validator.validateAll().then((isValid) => {
        if (!isValid) {
          this.loading = false;
          return;
        }
        if (this.user.account && this.user.password) {
          this.$store.dispatch("auth/login", this.user).then(
            () => {
              this.$router.push("/relay");
            },
            async (error) => {
              console.log("LoginMSG:", error.toString());
              this.loading = false;
              await ui.alert("登入失敗!" + error.toString());
            }
          );
        }
      });
    },
    leaveSystem() {
      this.$router.push("/Pathology");
    },
  },
};
</script>

<style>
html {
  /* background-color: #5e5e5e; */
  background-repeat: no-repeat;
  background-position: center;
  background-image: url(../../assets/img/BG/loginBG.png);
  background-color: #ddd;
  background-size: 100vw auto;
}

input:-internal-autofill-previewed,
input:-internal-autofill-selected {
  transition: 5000s ease-out 0.5s;
  -webkit-text-fill-color: #000;
}

.Login {
  height: 100vh;
  width: 100vw;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url(../../assets/img/BG/loginBG.png);
  background-size: cover;
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* @import "../assets/css/reset.css"; */
@import "../../assets/css/base.css";
@import "../../assets/css/font.css";
@import "../../assets/css/login.css";
</style>
