<template>
  <div class="List">
    <img src="img/BG/logo.png" height="13%" width="auto" />
    <div class="user">
      <label>
        <div class="user_online"></div>
        歡迎回來，{{ currentUser.username }}
      </label>
      <img alt="使用者圖片" src="img/icon/user.png" @click.prevent="slideDown" />
    </div>
    <div class="user_logout_function">
      <div class="user_logout_function_d" @click.prevent="toProfile">個人資訊</div>
      <div class="user_logout_function_d admin" @click.prevent="toAdmin">權限管理</div>
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
        <v-client-table :columns="columns" v-model="data" :options="options">
        </v-client-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ClientTable, Event } from "vue-tables-2";
import UserService from "../services/user.service";
import API from "../js/API";
import netTest from "../js/NetTest";

import Vue from "vue";
import VueEvents from "vue-events";

let user = JSON.parse(localStorage.getItem("user"));
const API_URL = API(API_URL) + "8088";
let clickFile = "尚未選取任何檔案";
let temp;
let admin = false;
let fileList =
  localStorage.getItem("fileList") === null || undefined
    ? []
    : JSON.parse(localStorage.getItem("fileList"));
let listData =
  localStorage.getItem("listData") === null || undefined
    ? []
    : JSON.parse(localStorage.getItem("listData"));

Vue.use(ClientTable); //Client table

export default {
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
      columns: ["name", "editor", "updatatime", "status"],
      data: listData,
      options: {
        headings: {
          name: "檔案名稱",
          editor: "最後標註者",
          updatatime: "更新時間",
          status: "標註狀態",
        },
        texts: {
          noResults: "無資料",
        },
        editableColumns: ["name"],
        sortable: ["name", "editor", "updatatime", "status"],
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
  mounted() {
    //判定是否登入
    if (!this.currentUser) {
      this.$router.push("/login");
    }
    //判定權限是否足夠
    if (this.currentUser.roles.indexOf("ROLE_ADMIN") == -1) {
      this.$router.push("/list");
    }
    //網路測試
    netTest();
    if (!localStorage.getItem("netTest")) {
      this.logOut();
    }
    //取得清單資料
    this.getListData();
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
    //設定檔案名
    setFileName() {
      this.$store.dispatch("setFileName", clickFile);
    },
    //清單點選事件
    onClick(event) {
      temp = String(event.target.innerHTML);
      if (temp.length < "35") {
        if (temp.indexOf(".png") != -1) {
          temp = temp.replace(".png", "");
          clickFile = temp;
          this.setFileName();
        }
      }
    },
    //開啟檔案
    ondblclick(event) {
      temp = String(event.target.innerHTML);
      if (temp.length < "35") {
        if (temp.indexOf(".png") != -1) {
          temp = temp.replace(".png", "");
          clickFile = temp;
          this.setFileName();
          if (clickFile.indexOf("尚未選取任何檔案") != -1) {
            alert("請選取已轉換好的檔案!");
          } else {
            this.filename = this.clickFile;
            this.$router.push("/case");
          }
        }
      }
    },
    //展開個人功能清單及登出功能
    slideDown() {
      $(".user_logout_function").slideToggle();
    },
    //取得清單JSON
    async getListData() {
      let tempData = [];
      tempData = await UserService.getListjson();
      tempData = tempData["data"];
      fileList = tempData;
      localStorage.setItem("fileList", JSON.stringify(tempData));
      this.getListInfo(tempData);
    },
    //搜尋
    search(keyword) {
      Event.$emit("vue-tables.filter::filterBySide", keyword);
    },
    //enter事件
    enter(event) {
      if (event.keyCode === 13) {
        this.search(this.$refs.keyword.value);
      }
    },
    //取得檔案資訊
    async getListInfo(data) {
      let temp = [];
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const element_name = data[key]["name"];
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
          const editor = data[key]["editor"] == null ? "無資料" : data[key]["editor"];
          let updatatime = data[key]["updatatime"];
          const status = data[key]["status"] == null ? "無資料" : data[key]["status"];
          if (updatatime == undefined) {
            updatatime = this.getBuildtime(name);
          }
          temp.push({ name, editor, updatatime, status });
        }
      }
      listData = temp;
      temp = JSON.stringify(temp);
      localStorage.setItem("listData", temp);
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
  background-image: url(../assets/img/BG/listMainBG.png);
  background-size: cover;
}

.VuePagination {
  display: none;
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../assets/css/base.css";
@import "../assets/css/font.css";
@import "../assets/css/list.css";
</style>
