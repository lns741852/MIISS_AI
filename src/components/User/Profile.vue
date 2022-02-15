<template>
  <div class="Profile">
    <img src="img/BG/logo.png" height="13%" width="auto" />
    <div class="user">
      <label>
        <div class="user_online"></div>
        歡迎回來，{{ userProfile.username }}
      </label>
      <img alt="使用者圖片" src="img/icon/user.png" @click.prevent="slideDown" />
    </div>
    <div class="user_logout_function">
      <div class="user_logout_function_d" @click.prevent="toList">玻片清單</div>
      <div class="user_logout_function_d Admin" @click.prevent="toAdmin">權限管理</div>
      <div class="user_logout_function_d Admin" @click.prevent="toClass">類別設定</div>
      <div class="user_logout_function_d" @click.prevent="logOut">帳號登出</div>
    </div>
    <button @click="toList" class="tran_btn back_btn">
      <img src="/img/icon/btn_back_c.png" alt="" />
    </button>

    <div class="listborder EditProfile_listborder">
      <div style="width: 50%">
        <div class="listborder_title">個 人 資 訊</div>
        <div class="input_div">
          <label class="input_label">
            使用者帳號：
            <small>不可修改</small>
          </label>
          <input type="text" v-model="currentUser.account" readonly />
          <br />
        </div>
        <div class="input_div">
          <label class="input_label"> 使用者姓名： </label>
          <input type="text" v-model="userProfile.username" />
          <br />
        </div>
        <div class="input_div">
          <label class="input_label">
            所屬科別：
            <small>不可修改</small>
          </label>
          <input type="text" v-model="userDivision" readonly />
          <br />
        </div>
        <div class="input_div">
          <label class="input_label">電子信箱：</label>
          <input type="text" v-model="userProfile.email" />
          <br />
        </div>
        <div class="input_div">
          <label class="input_label"> 連絡電話： </label>
          <input type="text" v-model="userProfile.phone" placeholder="請輸入純數字" />
          <br />
        </div>
        <div class="input_div input_div_pass">
          <label class="input_label">新密碼：</label>
          <input
            :type="pwType"
            v-model="userProfile.password"
            placeholder="若不修改請勿輸入"
          />
          <input type="checkbox" id="pass_cansee" @click="showPW" />
          <label for="pass_cansee" id="pass_cansee_img">
            <img src="/img/icon/layer_see_d.png" />
          </label>

          <br />
        </div>
        <div class="input_div">
          <label class="input_label">確認新密碼：</label>
          <input :type="pwType" v-model="rePW" placeholder="請與新密碼一致" />
          <br />
        </div>
        <div class="input_div">
          <button
            @click="modifiy"
            class="btn_bg_boder"
            style="width: 5.5rem; height: 2.5rem; background-size: 5.5rem 2.5rem"
          >
            確認修改
          </button>
          <br />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "../../services/user.service";
import profile from "../../models/profile.js";
import DC from "../../js/divisionConversion";
import Userinfo from "../../js/getUserinfo";

const ckpw = /^[a-zA-Z0-9]+$/;
const ckmail = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
const ckphone = /^[0-9#]+$/;

let userInfo = [];
let info = new profile("", "", "", "", "");

$.fn.toggleAttr = function (attr, attr1, attr2) {
  return this.each(function () {
    let self = $(this);
    if (self.attr(attr) == attr1) self.attr(attr, attr2);
    else self.attr(attr, attr1);
  });
};

export default {
  name: "Profile",
  components: {},
  data() {
    return {
      userProfile: info,
      userDivision: "",
      rePW: "",
      pwType: "password",
    };
  },
  computed: {
    //取得使用者資料
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  mounted() {
    //判斷是否登入
    if (!this.currentUser) {
      this.$router.push("/login");
    }
    //取得使用者資料
    this.getUserinfo();
    //網路測試
    this.testFunction();
  },
  methods: {
    //登出
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/login");
    },
    //展開個人功能清單及登出功能
    slideDown() {
      $(".user_logout_function").slideToggle();
      if (this.currentUser.roles.indexOf("ROLE_ADMIN") != -1) {
        $(".Admin").show();
      }
    },
    //轉至圖片清單
    toList() {
      this.$router.push("/relay");
    },
    //轉至使用者管理頁面
    toAdmin() {
      this.$router.push("/ctrl/admin");
    },
    //轉至類別設定頁面
    toClass() {
      this.$router.push("/ctrl/ClassEdit");
    },
    //取得個人資訊
    async getUserinfo() {
      let tempData = [];
      tempData = await UserService.getUserInfo();
      tempData = JSON.stringify(tempData);
      localStorage.setItem("userInfo", tempData);
      this.setUserinfo();
    },
    /**設定個人資料 */
    setUserinfo() {
      userInfo = Userinfo();
      info = new profile(
        userInfo.username,
        userInfo.division,
        userInfo.email,
        userInfo.phone,
        ""
      );
      this.userProfile = info;
      this.userDivision = DC(info.division);
    },
    //顯示密碼
    showPW() {
      $("#pass_cansee_img img").toggleAttr(
        "src",
        "/img/icon/layer_see_d.png",
        "/img/icon/layer_see.png"
      );
      if (this.pwType === "password") {
        this.pwType = "text";
      } else {
        this.pwType = "password";
      }
    },
    //修改個人資料
    async modifiy() {
      let mail = this.userProfile.email;
      let phone = this.userProfile.phone;
      let pw = this.userProfile.password;
      let check = true;

      if (!ckmail.test(mail)) {
        await ui.alert("電子信箱格式錯誤，請檢查\n輸入的電子信箱：" + mail);
        check = false;
      }
      if (!ckphone.test(phone) || phone.length < 8 || phone.length > 20) {
        await ui.alert("電話格式錯誤，請檢查\n輸入的電話：" + phone);
        check = false;
      }
      if (pw.length != 0) {
        if (!ckpw.test(pw) || pw.length < 7 || pw.length > 20) {
          await ui.alert(
            "請再次確認密碼是否輸入一致並符合密碼規則：8-20英數混合\n輸入的密碼：" + pw
          );
          check = false;
        }
      }

      if (check) {
        await UserService.putUserInfo(this.userProfile);
        setTimeout(async () => {
          let MSG = localStorage.getItem("MSG");
          MSG = JSON.parse(MSG);
          if ((MSG == null) | undefined) {
            await ui.alert("沒有任何的修改");
          } else {
            if (MSG.message.indexOf("successfully") != -1) {
              await ui.alert("使用者資訊更新成功!");
              this.getUserinfo();
              localStorage.removeItem("MSG");
            } else {
              await ui.alert("使用者資訊更新失敗!");
            }
          }
        }, 250);
      }
    },
    //發送請求
    async sendInfo(type) {
      switch (type) {
        case "p":
          // console.log("p");
          await UserService.putUserPW(this.userProfile);
          break;
        case "m":
          // console.log("m");
          await UserService.putUserCI(this.userProfile);
          break;
        case "mh":
          // console.log("mh");
          await UserService.putUserCI(this.userProfile);
          break;
        case "mp":
          // console.log("mp");
          await UserService.putUserInfo(this.userProfile);
          break;
        case "h":
          // console.log("h");
          await UserService.putUserCI(this.userProfile);
          break;
        case "hp":
          // console.log("hp");
          await UserService.putUserInfo(this.userProfile);
          break;
        case "all":
          // console.log("all");
          await UserService.putUserInfo(this.userProfile);
          break;

        default:
          break;
      }
    },
    //網路測試
    async testFunction() {
      let code = "";
      code = await UserService.testConnection(code);
      if (code != "") {
        console.log("error code:", code);
        if (code.indexOf("401") != -1) {
          alert("登入已逾時，請重新登入");
          this.logOut();
          this.$router.push("/login");
        } else if (code.indexOf("403") != -1) {
          alert("此帳號未啟用，如果持續發生請回報 錯誤碼:" + code);
          this.logOut();
          this.$router.push("/login");
        } else if (code.indexOf("404") != -1) {
          alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
        } else if (code.indexOf("500") != -1) {
          alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
        } else if (code.indexOf("503") != -1) {
          alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
        } else if (code.indexOf("504") != -1) {
          alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
        } else {
          alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
        }
      }
    },
  },
  beforeDestroy() {
    localStorage.removeItem("MSG");
  },
};
</script>

<style>
html {
  color: #b0c4ff;
  background-repeat: no-repeat;
  background-position: center;
  background-color: #ddd;
  background-size: 100vw auto;
}

.Profile {
  height: 100vh;
  width: 100vw;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url(../../assets/img/BG/listMainBG.png);
  background-size: cover;
}

.Admin {
  display: none;
}

.VuePagination {
  display: none;
}
</style>

<style scoped>
@import "../../assets/css/base.css";
@import "../../assets/css/font.css";
@import "../../assets/css/profile.css";
</style>
