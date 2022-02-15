<template>
  <div
    id="Relay"
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    "
  >
    <div>
      <div class="lds-spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <br /><span style="color: #cef"> 讀 取 中 </span>
  </div>
</template>

<script>
import UserService from "../../services/user.service";
import API from "../../js/API";

const API_URL = API(API_URL) + "8088";
let userInfo;
let usersList;
let syntaxList;

export default {
  name: "Relay",
  components: {},
  data() {
    return {};
  },
  computed: {
    //取得使用者資料
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  created() {
    //判定是否登入
    if (!this.currentUser) {
      this.$router.push("/login");
    }
  },
  watch: {},
  async mounted() {
    //網路測試
    await this.testFunction();
    //移除舊有資料
    await this.removeOlddata();
    //取得個人資訊
    this.getUserinfo();
    //取得各清單資料
    await this.getListData();
    this.getLabeldata();
    //判定權限是否足夠
    if (this.currentUser.roles.indexOf("ROLE_ADMIN") != -1) {
      await this.getUserslist();
    }
    setTimeout(() => {
      this.$router.push("/list");
    }, 150);
  },
  methods: {
    //登出
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/login");
    },
    //移除舊有資料
    removeOlddata() {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("listData");
      localStorage.removeItem("usersList");
    },
    //取得個人資訊
    async getUserinfo() {
      let tempData = [];
      tempData = await UserService.getUserInfo();
      userInfo = tempData;
      userInfo = JSON.stringify(userInfo);
      localStorage.setItem("userInfo", userInfo);
      // console.log(userInfo);
    },
    //取得玻片清單JSON
    async getListData() {
      let tempData = [];
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
          const editor =
            data[key]["editor"] == null ? "無資料" : data[key]["editor"];
          let updatatime = data[key]["updatedtime"];
          let status =
            data[key]["status"] == null ? "無資料" : data[key]["status"];
          if (updatatime == undefined || updatatime == null) {
            updatatime = this.getBuildtime(name);
          }
          temp.push({ name, editor, updatatime, status, path });
        }
      }
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
    //取得共通性類別資料
    async getLabeldata() {
      let tempData = [];
      tempData = await UserService.getAdminlabelJson();
      tempData = JSON.stringify(tempData);
      localStorage.setItem("labelData", tempData);
    },
    //取得使用者清單JSON
    async getUserslist() {
      let tempData = [];
      usersList = await UserService.getUserslist();
      tempData = usersList;
      tempData = JSON.stringify(tempData);
      usersList = JSON.stringify(usersList, this.reDiv);
      localStorage.setItem("usersList", tempData);
      localStorage.setItem("usersListre", usersList);
    },
    //科別轉換
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
};
</script>
<style scoped>
@import "../../assets/css/relay.css";
</style>
