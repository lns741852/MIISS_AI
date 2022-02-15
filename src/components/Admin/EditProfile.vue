<template>
  <div class="EditProfile">
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
      <div class="user_logout_function_d" @click.prevent="toAdmin">權限管理</div>
      <div class="user_logout_function_d" @click.prevent="toClass">類別設定</div>
      <div class="user_logout_function_d" @click.prevent="logOut">帳號登出</div>
    </div>
    <button @click="toAdmin" class="tran_btn back_btn">
      <img src="/img/icon/btn_back_c.png" alt="" />
    </button>
    <div class="listborder EditProfile_listborder">
      <div style="width: 50%">
        <div class="listborder_title">修 改 帳 號</div>
        <div class="input_div">
          <label class="input_label"> 使用者姓名：</label>
          <input type="text" v-model="username" required /><br />
        </div>
        <div class="input_div">
          <label class="input_label">科別：</label>
          <select v-model="division">
            <option value="General Pathology">一般病理科</option>
            <option value="General Laboratory">一般檢驗科</option>
            <option value="Central Laboratory">中央檢驗科</option>
            <option value="Molecular Pathology">分子病理科</option>
            <option value="Surgical Pathology">外科病理科</option>
            <option value="Quality Management">品保科</option>
            <option value="Cytopathology">細胞病理科</option>
            <option value="Microbiology">微生物科</option>
            <option value="Others">其他</option>
          </select>
          <br />
        </div>
        <div class="input_div">
          <label class="input_label">電子信箱：</label>
          <input type="text" v-model="email" required /><br />
        </div>
        <div class="input_div">
          <label class="input_label">連絡電話：</label>
          <input type="text" v-model="phone" placeholder="請輸入純數字" required /><br />
        </div>
        <div class="input_div" style="margin-top: 1.5rem">
          <button
            @click="resetPW"
            class="btn_bg_boder"
            style="width: 5.5rem; background-size: 5.5rem 2rem; margin-right: 2rem"
          >
            重置密碼
          </button>
          <button @click="saveEdit" class="btn_bg_boder">儲存</button>
        </div>
        <h1>{{ resetPWr }}</h1>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import UserService from "../../services/user.service";
import DC from "../../js/divisionConversion";
import Userinfo from "../../js/getUserinfo";
import profile from "../../models/profile.js";

let info = new profile("", "", "", "", "");
let editData;
let temp;
let usersList;
let errorMSG = "";
const ckmail = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
const ckphone = /^[0-9#]+$/;

export default {
  name: "EditProfile",
  components: {},
  data() {
    return {
      userProfile: info,
      username: "",
      division: "",
      email: "",
      phone: "",
      resetPWr: "",
    };
  },
  computed: {
    //取得使用者資料
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  mounted() {
    //判定是否登入
    if (!this.currentUser) {
      this.$router.push("/login");
    }
    //判定權限是否足夠
    if (this.currentUser.roles.indexOf("ROLE_ADMIN") == -1) {
      this.$router.push("/list");
    }
    //設定使用者資料
    this.setUserinfo();
    //網路測試
    this.testFunction();
    //取得並設定資料
    this.getEditData();
    this.setEditData();
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
    /**取得個人資訊*/
    async getUserinfo() {
      let tempData = [];
      tempData = await UserService.getUserInfo();
      tempData = JSON.stringify(tempData);
      localStorage.setItem("userInfo", tempData);
    },
    /**設定個人資料 */
    setUserinfo() {
      let userInfo = Userinfo();
      info = new profile(
        userInfo.username,
        userInfo.division,
        userInfo.email,
        userInfo.phone,
        ""
      );
      this.userProfile = info;
    },
    //取得資料並判斷是否為空
    async getEditData() {
      editData = JSON.parse(localStorage.getItem("editUser"));
      if (editData === null || editData === undefined) {
        await ui.alert("請選擇編輯的使用者");
        this.toAdmin();
      }
    },
    //設定使用者資料
    setEditData() {
      this.username = editData.username;
      this.division = editData.division;
      this.email = editData.email;
      this.phone = editData.phone;
    },
    //儲存修改
    async saveEdit() {
      const saveData = new profile(this.username, this.division, this.email, this.phone);
      errorMSG = "";
      let check = await this.checkForm(saveData);
      temp = DC(this.division);
      if (check) {
        if (
          await ui.confirm(
            "以下為輸入的資料:\n" +
              "使用者姓名：" +
              this.username +
              "\n科別：" +
              temp +
              "\n電子信箱：" +
              this.email +
              "\n連絡電話：" +
              this.phone,
            "確認無誤請點選確認儲存修改"
          )
        ) {
          await UserService.ModifyAccess(editData._id, saveData);
          setTimeout(async () => {
            let MSG = localStorage.getItem("MSG");
            MSG = JSON.parse(MSG);
            if (MSG.message.indexOf("successfully") != -1) {
              await ui.alert("使用者資訊更新成功!");
              if (this.currentUser.id == editData._id) {
                await this.getUserinfo();
              }
              this.toAdmin();
            } else {
              await ui.alert("使用者資訊更新失敗!");
            }
          }, 250);
        }
      } else {
        await ui.alert("錯誤訊息\n" + errorMSG);
      }
    },
    //重置密碼
    async resetPW() {
      if (
        await ui.confirm(
          "你確定要重置該使用者的密碼嗎?" + "\n目前使用者：" + this.username
        )
      ) {
        await UserService.ReSetPW(editData._id);
        setTimeout(async () => {
          let pw = localStorage.getItem("pw");
          pw = JSON.parse(pw);
          this.resetPWr = pw.password;
          await ui.alert(this.resetPWr);
          this.resetPWr = "新密碼：" + this.resetPWr;
        }, 500);
      }
    },
    //表單資料檢查
    checkForm(profile) {
      if (profile.username === "") {
        errorMSG = "請輸入姓名";
        return false;
      }
      if (profile.division === "" || null) {
        errorMSG = "請選擇科別";
        return false;
      }
      if (!ckmail.test(profile.email)) {
        errorMSG = "請輸入符合格式的電子信箱\n目前輸入：" + this.email;
        return false;
      }
      if (!ckphone.test(profile.phone) || this.phone.length > 20) {
        errorMSG = "請輸入符合格式的電話\n目前輸入：" + this.phone;
        return false;
      }
      return true;
    },
    //取得清單JSON
    async getListData() {
      let tempData = [];
      usersList = await UserService.getUserslist();
      tempData = usersList;
      tempData = JSON.stringify(tempData);
      usersList = JSON.stringify(usersList, DC);
      localStorage.setItem("usersList", tempData);
      localStorage.setItem("usersListre", usersList);
    },
    //網路測試
    async testFunction() {
      let code = "";
      code = await UserService.testConnection(code);
      if (code != "") {
        console.log("error code:", code);
        if (code.indexOf("401") != -1) {
          await ui.alert("登入已逾時，請重新登入");
          this.logOut();
          this.$router.push("/login");
        } else if (code.indexOf("403") != -1) {
          await ui.alert("此帳號未啟用，如果持續發生請回報 錯誤碼:" + code);
          this.logOut();
          this.$router.push("/login");
        } else if (code.indexOf("404") != -1) {
          await ui.alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
        } else if (code.indexOf("500") != -1) {
          await ui.alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
        } else if (code.indexOf("503") != -1) {
          await ui.alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
        } else if (code.indexOf("504") != -1) {
          await ui.alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
        } else {
          await ui.alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
        }
      }
    },
  },
  //離開此頁面執行的動作
  beforeDestroy() {
    localStorage.removeItem("editUser");
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

.VuePagination {
  display: none;
}
</style>

<style scoped>
@import "../../assets/css/base.css";
@import "../../assets/css/font.css";
@import "../../assets/css/profile.css";
</style>
