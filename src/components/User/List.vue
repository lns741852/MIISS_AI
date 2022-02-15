<template>
  <div class="List">
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
      <div class="user_logout_function_d admin" @click.prevent="toAdmin">權限管理</div>
      <div class="user_logout_function_d admin" @click.prevent="toClass">類別設定</div>
      <div class="user_logout_function_d" @click.prevent="logOut">帳號登出</div>
    </div>

    <div class="bar">
      <table>
        <tbody>
          <tr>
            <td colspan="2">
              <label>目前選取檔案：{{ getselectFile }}</label>
            </td>
            <td colspan="1">
              <label>檢索：&ensp;</label>
              <input
                type="text"
                ref="keyword"
                class="form-control"
                value=""
                placeholder="以檔案名稱搜尋"
              />
              <button class="icon-search" @click="search($refs.keyword.value)"></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="listborder">
      <div class="list" @click="onClick" @dblclick="ondblclick">
        <v-client-table
          ref="listTable"
          id="listTable"
          :columns="columns"
          v-model="data"
          :options="options"
        >
        </v-client-table>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { ClientTable, Event } from "vue-tables-2";
import UserService from "../../services/user.service";
import API from "../../js/API";
import Userinfo from "../../js/getUserinfo";
import profile from "../../models/profile.js";
import VtSaveCheckVue from "../VT/VtSaveCheck.vue";

let info = new profile("", "", "", "", "");
const API_URL = API(API_URL) + "8088";
let clickFile = "尚未選取任何檔案";
let temp;

Vue.use(ClientTable); //Client table

export default {
  created() {},
  components: {},
  computed: {
    //取得使用者資料
    currentUser() {
      return this.$store.state.auth.user;
    },
    //取得當下選取檔案名
    getselectFile() {
      return this.$store.state.selectFile;
    },
  },
  data() {
    return {
      userProfile: info,
      columns: ["name", "editor", "updatatime", "status"],
      data: [],
      options: {
        headings: {
          name: "檔案名稱",
          editor: "最後標註者",
          updatatime: "更新時間/建立時間",
          status: "標註狀態",
        },
        texts: {
          noResults: "無資料",
        },
        orderBy: { column: "name" },
        sortable: ["name", "editor", "updatatime", "status"],
        templates: { status: VtSaveCheckVue },
        perPage: 9999999,
        perPageValues: [],
        pagination: false,
        showChildRowToggler: false,
        filterable: false,
        customFilters: [
          {
            name: "filterBySide",
            callback: function (row, query) {
              return row.name.toLowerCase().includes(query.toLowerCase());
            },
          },
        ],
      },
    };
  },
  async mounted() {
    //判定是否登入
    if (!this.currentUser) {
      this.$router.push("/login");
    }
    //判定權限是否足夠
    if (this.currentUser.roles.indexOf("ROLE_ADMIN") != -1) {
      $(".admin").show();
    }
    //設定使用者資料
    this.setUserinfo();
    this.$refs.listTable.setLoadingState(true);
    //網路測試
    await this.testFunction();
    //取得清單資料
    await this.getListData();
    this.$refs.listTable.setLoadingState(false);
    //監控enter
    window.addEventListener("keyup", this.enter);
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
    //轉至使用者管理頁面
    toAdmin() {
      this.$router.push("/ctrl/admin");
    },
    //轉至類別設定頁面
    toClass() {
      this.$router.push("/ctrl/ClassEdit");
    },
    //設定檔案名
    setFileName() {
      this.$store.dispatch("setFileName", clickFile);
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
    //搜尋
    search(keyword) {
      Event.$emit("vue-tables.filter::filterBySide", keyword);
    },
    //enter事件
    enter(event) {
      if (event.keyCode === 13) {
        if (this.$refs.keyword.value != undefined || this.$refs.keyword.value != "") {
          this.search(this.$refs.keyword.value);
        } else {
          this.search("");
        }
      }
    },
    //清單點選事件
    async onClick(event) {
      temp = String(event.path[1].children[0].innerText);
      if (temp == "") {
        temp = String(event.path[2].children[0].innerText);
      }
      if (temp == "") {
        temp = String(event.path[3].children[0].innerText);
      }
      if (
        temp.length > 20 &&
        temp.indexOf("檔案名稱") == -1 &&
        temp.indexOf("最後標註者") == -1 &&
        temp.indexOf("更新時間/建立時間") == -1 &&
        temp.indexOf("標註狀態") == -1 &&
        temp.indexOf("無資料") == -1 &&
        temp != ""
      ) {
        clickFile = temp;
        this.setFileName();
      }
    },
    //開啟檔案
    async ondblclick(event) {
      temp = String(event.path[1].children[0].innerText);
      if (temp == "") {
        temp = String(event.path[2].children[0].innerText);
      }
      if (temp == "") {
        temp = String(event.path[3].children[0].innerText);
      }
      if (
        temp.length > 20 &&
        temp.indexOf("檔案名稱") == -1 &&
        temp.indexOf("最後標註者") == -1 &&
        temp.indexOf("更新時間/建立時間") == -1 &&
        temp.indexOf("標註狀態") == -1 &&
        temp.indexOf("無資料") == -1 &&
        temp != ""
      ) {
        clickFile = temp;
        this.filename = this.clickFile;
        localStorage.setItem("filePath", this.getPath(clickFile));
        this.$router.push("/case");
      }
    },
    //取得清單JSON
    async getListData() {
      let tempData = [];
      let syntaxList = [];
      tempData = await UserService.getSyntaxlistJson();
      syntaxList = tempData["data"];
      syntaxList = this.covFilenameJ(syntaxList);
      localStorage.setItem("fileList", JSON.stringify(syntaxList));
      this.getListInfo(syntaxList);
    },
    //取得檔案資訊
    async getListInfo(data) {
      let temp = [];
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          let element_name = this.covFilename(data[key]["name"]);
          temp.push(element_name);
        }
      }
      temp = { host: temp };
      data = await UserService.getListDatajson(temp);
      this.rebuildList(data);
    },
    //重新序列化為所需格式
    rebuildList(data) {
      let temp = [];
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const name = data[key]["name"];
          const path = this.getPath(key) != null ? this.getPath(key) : "";
          const editor = data[key]["editor"] == null ? "無資料" : data[key]["editor"];
          let updatatime = data[key]["updatedtime"];
          let status = data[key]["status"] == null ? "無資料" : data[key]["status"];
          if (updatatime == undefined || updatatime == null) {
            updatatime = this.getBuildtime(name);
          }
          temp.push({ name, editor, updatatime, status, path });
        }
      }
      this.data = temp;
      temp = JSON.stringify(temp);
      localStorage.setItem("listData", temp);
    },
    //檔案名稱處理
    covFilename(name) {
      if (name.indexOf(".jpg") != -1) {
        name = name.replace(".jpg", "");
        return name;
      }
      if (name.indexOf(".png") != -1) {
        name = name.replace(".png", "");
        return name;
      }
      if (name.indexOf(".isyntax") != -1) {
        name = name.replace(".isyntax", "");
        return name;
      }
      return name;
    },
    //檔案名稱處理(JSON用)
    covFilenameJ(data) {
      let temp = [];
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const name = this.covFilename(data[key]["name"]);
          const time = data[key]["time"];
          const path = data[key]["path"];
          temp.push({ name, time, path });
        }
      }
      return temp;
    },
    //取得路徑
    getPath(id) {
      const tempJSON = JSON.parse(localStorage.getItem("fileList"));
      for (const key in tempJSON) {
        if (tempJSON.hasOwnProperty(key)) {
          const el = tempJSON[key];
          if (el.name == id) {
            return el.path;
          }
        }
      }
    },
    //取得建立時間
    getBuildtime(id) {
      const tempJSON = JSON.parse(localStorage.getItem("fileList"));
      for (const key in tempJSON) {
        if (tempJSON.hasOwnProperty(key)) {
          const el = tempJSON[key];
          if (el.name == id) {
            return el.time;
          }
        }
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
          alert("伺服器發生錯誤，如果持續發生請回報 錯誤碼:" + code);
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
    window.removeEventListener("keyup", this.handleMessage);
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

.List {
  height: 100vh;
  width: 100vw;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url(../../assets/img/BG/listMainBG.png);
  background-size: cover;
}

.admin {
  display: none;
}

.VuePagination {
  display: none;
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../../assets/css/base.css";
@import "../../assets/css/font.css";
@import "../../assets/css/list.css";
</style>
