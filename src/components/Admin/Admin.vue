<template>
  <div class="adminList">
    <img src="img/BG/logo.png" height="13%" width="auto" />
    <div class="user">
      <label>
        <div class="user_online"></div>
        歡迎回來，{{ userProfile.username }}
      </label>
      <img alt="使用者圖片" src="img/icon/user.png" @click.prevent="slideDown" />
    </div>
    <div class="user_logout_function">
      <div class="user_logout_function_d" @click.prevent="toProfile">個人資訊</div>
      <div class="user_logout_function_d" @click.prevent="toList">玻片清單</div>
      <div class="user_logout_function_d admin" @click.prevent="toClass">類別設定</div>
      <div class="user_logout_function_d" @click.prevent="logOut">帳號登出</div>
    </div>
    <div class="adminbar">
      <table>
        <tbody>
          <tr>
            <td colspan="2"></td>
            <td colspan="1">
              <button @click="toAddaccess" class="newaccount_btn">新 增 帳 號</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="listborder">
      <div class="userList">
        <v-client-table
          ref="listTable"
          :columns="columns"
          v-model="data"
          :options="options"
        >
        </v-client-table>
      </div>
    </div>
  </div>
</template>

<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/js/all.min.js"></script>
<script>
/* eslint-disable */
import Vue from "vue";
import { ClientTable, Event } from "vue-tables-2";
import UserService from "../../services/user.service";
import Userinfo from "../../js/getUserinfo";
import profile from "../../models/profile.js";

import VtCheckboxVue from "../VT/VtCheckbox";

let info = new profile("", "", "", "", "");
let temp;
let selectUser = "";
let usersList =
  localStorage.getItem("usersListre") !== null
    ? JSON.parse(localStorage.getItem("usersListre"))
    : [];

Vue.use(ClientTable); //Client table

export default {
  components: {},
  computed: {
    //取得使用者資料
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  data() {
    return {
      userProfile: info,
      username: "",
      columns: ["username", "division", "account", "email", "activation"],
      data: [],
      options: {
        headings: {
          username: "姓名",
          division: "科別",
          account: "帳號",
          email: "電子信箱",
          activation: "啟用狀態",
        },
        templates: { activation: VtCheckboxVue },
        editableColumns: ["name"],
        perPage: 9999999,
        perPageValues: [],
        pagination: false,
        showChildRowToggler: false,
        filterable: false,
        destroyEventBus: true,
      },
    };
  },
  created() {},
  async mounted() {
    this.$refs.listTable.setLoadingState(true);
    let vm = this;
    //接收啟用/停用事件
    Event.$on("vue-tables.accountActivationstatus", function (data) {
      temp = vm.data.find((x) => x.account === data.account);
      temp.activation = data.activation;
      selectUser = temp._id;
      // console.log("temp", temp.activation);
      vm.activateCheck(selectUser, temp.activation);
    });
    //接收編輯事件
    Event.$on("vue-tables.edit", function (data) {
      temp = vm.data.find((x) => x.account === data.account);
      selectUser = temp.account;
      vm.editAccount(selectUser);
    });
    //接收刪除事件
    Event.$on("vue-tables.delete", function (data) {
      temp = vm.data.find((x) => x.account === data.account);
      vm.deleteAccount(temp.account, temp._id);
    });
    //判定是否登入
    if (!this.currentUser) {
      this.$router.push("/login");
    }
    //判定權限是否足夠
    if (this.currentUser.roles.indexOf("ROLE_ADMIN") == -1) {
      this.$router.push("/list");
    } else {
      $(".admin").show();
    }
    //取得清單資料
    await this.getUserlistData();
    this.$refs.listTable.setLoadingState(false);
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
    //轉至使用者資料頁面
    toProfile() {
      this.$router.push("/profile");
    },
    //轉至圖片清單
    toList() {
      this.$router.push("/relay");
    },
    //轉至類別設定頁面
    toClass() {
      this.$router.push("/ctrl/ClassEdit");
    },
    //轉至新增帳號
    toAddaccess() {
      this.$router.push("/ctrl/addaccess");
    },
    //展開個人功能清單及登出功能
    slideDown() {
      $(".user_logout_function").slideToggle();
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
    //取得使用者清單JSON
    async getUserlistData() {
      let tempData = [];
      tempData = await UserService.getUserslist();
      tempData = JSON.stringify(tempData);
      localStorage.setItem("usersList", tempData);
      tempData = JSON.stringify(JSON.parse(tempData), this.reDiv);
      localStorage.setItem("usersListre", tempData);
      usersList = JSON.parse(tempData);
      this.data = usersList;
    },
    //帳號啟動判別
    activateCheck(account, flag) {
      UserService.EnableAccess(account, flag);
      setTimeout(() => {
        this.getUserlistData();
      }, 100);
      if (flag) {
        setTimeout(async () => {
          let MSG = localStorage.getItem("MSG");
          MSG = JSON.parse(MSG);
          if (MSG.message.indexOf("successfully") != -1) {
            await ui.alert("使用者啟用成功!");
            // this.$router.go(0);
          } else {
            await ui.alert("使用者啟用失敗!");
          }
        }, 500);
        return 0;
      } else {
        setTimeout(async () => {
          let MSG = localStorage.getItem("MSG");
          MSG = JSON.parse(MSG);
          if (MSG.message.indexOf("successfully") != -1) {
            await ui.alert("使用者停用成功!");
            // this.$router.go(0);
          } else {
            await ui.alert("使用者停用失敗!");
          }
        }, 500);
        // return 0;
      }
    },
    //帳號編輯
    editAccount(account) {
      localStorage.removeItem("editUser");
      this.getUserInfo(account);
      setTimeout(async () => {
        if (
          await ui.confirm(
            "目前選取使用者為：" + account + "\n是否確認要編輯該使用者資料?"
          )
        ) {
          this.$router.push("/ctrl/editprofile");
        }
      });
    },
    //帳號刪除
    deleteAccount(account, id) {
      setTimeout(async () => {
        if (
          await ui.confirm("目前選取使用者為：" + account + "\n是否確認要刪除該使用者?")
        ) {
          await UserService.DeleteAccess(id);
          setTimeout(async () => {
            await this.getUserlistData();
          }, 100);
          setTimeout(async () => {
            let MSG = localStorage.getItem("MSG");
            MSG = JSON.parse(MSG);
            if (MSG.message.indexOf("successfully") != -1) {
              await ui.alert("使用者刪除成功!");
            } else {
              await ui.alert("使用者刪除失敗!");
            }
            this.getUserlistData();
          }, 500);
        }
      });
    },
    //取得特定使用者資料
    getUserInfo(account) {
      const tempJSON = JSON.parse(localStorage.getItem("usersList"));
      for (const key in tempJSON) {
        if (tempJSON.hasOwnProperty.call(tempJSON, key)) {
          const element = tempJSON[key];
          const element_account = tempJSON[key].account;
          if (element_account === account) {
            localStorage.setItem("editUser", JSON.stringify(element));
          }
        }
      }
    },
    //科別轉換(JSON)
    reDiv(key, value) {
      switch (value) {
        case "General Pathology":
          return "一般病理科";
        case "General Laboratory":
          return "一般檢驗科";
        case "Central Laboratory":
          return "中央檢驗科";
        case "Molecular Pathology":
          return "分子病理科";
        case "Surgical Pathology":
          return "外科病理科";
        case "Quality Management":
          return "品保科";
        case "Cytopathology":
          return "細胞病理科";
        case "Microbiology":
          return "微生物科";
        case "Others":
          return "其他";
        default:
          return value;
      }
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
  beforeDestroy() {},
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

.adminList {
  height: 100vh;
  width: 100vw;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url(/img/BG/loginBG4.png);
  background-size: cover;
}

.VuePagination {
  display: none;
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css";
@import "../../assets/css/base.css";
@import "../../assets/css/font.css";
@import "../../assets/css/admin.css";
</style>
