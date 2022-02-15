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
        <div class="listborder_title">建 立 帳 號</div>
        <form>
          <div class="input_div">
            <label class="input_label"> 帳號： </label>
            <input
              type="text"
              v-model="account"
              placeholder="帳號長度至少8碼，僅允許英數"
              required
            /><br />
          </div>
          <div class="input_div input_div_pass">
            <label> 密碼： </label>
            <input
              :type="pwType"
              v-model="password"
              placeholder="密碼長度至少8位最長20位，且必須包含1個英文和1個數字"
              required
            />
            <input type="checkbox" id="pass_cansee" @click="showPW" />
            <label for="pass_cansee" id="pass_cansee_img">
              <img src="/img/icon/layer_see_d.png" />
            </label>

            <br />
          </div>
          <div class="input_div">
            <label> 確認密碼： </label><input :type="pwType" v-model="repw" /><br />
          </div>
          <div class="input_div">
            <label> 使用者姓名： </label>
            <input type="text" v-model="username" required /><br />
          </div>
          <div class="input_div">
            <label> 科別： </label>
            <select name="" id="" v-model="division" required>
              <option value="General Pathology" selected>一般病理科</option>
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
            <label> 電子信箱： </label>
            <input type="text" v-model="email" required /><br />
          </div>
          <div class="input_div">
            <label> 連絡電話： </label>
            <input type="text" v-model="phone" placeholder="請輸入純數字" required />
            <br />
          </div>
          <div class="input_div" style="margin-top: 1.5rem">
            <button @click="clear" class="btn_bg_boder" style="margin-right: 2rem">
              清除
            </button>
            <button @click="addAccess" type="submit" class="btn_bg_boder">新增</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import UserService from "../../services/user.service.js";
import Userinfo from "../../js/getUserinfo";
import addUser from "../../models/adduser.js";
import profile from "../../models/profile.js";

let info = new profile("", "", "", "", "");
const ckaccess = /^[a-zA-Z0-9]\w+$/;
const ckpw = /^[a-zA-Z0-9]+$/;
const ckmail = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
const ckphone = /^[0-9#]+$/;
let errorMSG = "";

$.fn.toggleAttr = function (attr, attr1, attr2) {
  return this.each(function () {
    let self = $(this);
    if (self.attr(attr) == attr1) self.attr(attr, attr2);
    else self.attr(attr, attr1);
  });
};

export default {
  name: "AddAccess",
  components: {},
  data() {
    return {
      userProfile: info,
      account: "",
      password: "",
      repw: "",
      username: "",
      division: "",
      email: "",
      phone: "",
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
    //清空輸入
    clear() {
      this.account = "";
      this.password = "";
      this.repw = "";
      this.username = "";
      this.division = "";
      this.email = "";
      this.phone = "";
    },
    //新增帳號
    async addAccess() {
      errorMSG = "";
      let check = this.checkForm();
      const adduser = new addUser(
        this.account,
        this.username,
        this.password,
        this.division,
        this.email,
        this.phone
      );
      // console.log(adduser);
      if (check) {
        await UserService.AddAccess(adduser);
        setTimeout(async () => {
          let MSG = localStorage.getItem("MSG");
          MSG = JSON.parse(MSG);
          if (MSG.message.indexOf("successfully") != -1) {
            await ui.alert("使用者新增成功!");
            this.getListData();
            // this.$router.push("/ctrl/admin");
          } else {
            if (MSG.message.indexOf("in use") != -1) {
              errorMSG = "此帳號已被使用";
            }
            if (MSG.message.indexOf("including at least") != -1) {
              errorMSG = "密碼必須含有至少1個英文和1個數字";
            }
            await ui.alert("使用者新增失敗!\n錯誤訊息：" + errorMSG);
          }
        }, 500);
      } else {
        await ui.alert("使用者新增失敗!\n錯誤訊息：" + errorMSG);
      }
    },
    //表單資料檢查
    checkForm() {
      if (!ckaccess.test(this.account) || this.account.length !== 8) {
        errorMSG =
          "請輸入符合格式的帳號，帳號長度至少8碼，僅允許英數\n目前輸入：" + this.account;
        return false;
      }
      if (!ckpw.test(this.password) || this.password.length < 8 || this.password > 20) {
        errorMSG =
          "請輸入符合格式的密碼\n密碼長度至少8位最長20位，且必須包含1個英文和1個數字\n目前輸入：" +
          this.password;
        return false;
      }
      if (this.repw != this.password) {
        errorMSG = "請確認確認密碼欄位是否與密碼相同\n";
        return false;
      }
      if (this.username === "") {
        errorMSG = "請輸入姓名";
        return false;
      }
      if (this.division === "" || null) {
        errorMSG = "請選擇科別";
        return false;
      }
      if (!ckmail.test(this.email)) {
        errorMSG = "請輸入符合格式的電子信箱\n目前輸入：" + this.email;
        return false;
      }
      if (!ckphone.test(this.phone) || this.phone.length > 20) {
        errorMSG = "請輸入符合格式的電話\n目前輸入：" + this.phone;
        return false;
      }
      return true;
    },
    //取得清單JSON
    async getListData() {
      let usersList = [];
      let tempData = [];
      usersList = await UserService.getUserslist();
      tempData = usersList;
      tempData = JSON.stringify(tempData);
      usersList = JSON.stringify(usersList, this.reDiv);
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
          alert("登入已逾時，請重新登入");
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
};
</script>

<style scoped>
@import "../../assets/css/base.css";
@import "../../assets/css/font.css";
@import "../../assets/css/profile.css";
</style>
