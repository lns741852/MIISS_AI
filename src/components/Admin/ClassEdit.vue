<template>
  <div class="ClassEdit">
    <img src="img/BG/logo.png" height="13%" width="auto" />
    <div class="user">
      <label>
        <div class="user_online"></div>
        歡迎回來，{{ userProfile.username }}
      </label>
      <img
        alt="使用者圖片"
        src="img/icon/user.png"
        @click.prevent="slideDown"
      />
    </div>
    <div class="user_logout_function">
      <div class="user_logout_function_d" @click.prevent="toProfile">
        個人資訊
      </div>
      <div class="user_logout_function_d" @click.prevent="toList">玻片清單</div>
      <div class="user_logout_function_d" @click.prevent="toAdmin">
        權限管理
      </div>
      <div class="user_logout_function_d" @click.prevent="logOut">帳號登出</div>
    </div>
    <button @click="toAdmin" class="tran_btn back_btn">
      <img src="/img/icon/btn_back_c.png" alt="" />
    </button>
    <div class="listborder EditProfile_listborder">
      <div style="width: 80%; height: 90%">
        <div
          class="listborder_title"
          style="
            display: flex;
            justify-content: space-between;
            margin-top: 0.5rem;
            margin-bottom: 1rem;
            align-items: baseline;
          "
        >
          <span>標註類別設定</span>
          <button
            class="tran_btn new_class_btn"
            id="add_new_class"
            style="height: 1.5rem"
            @click="Class_table_new"
          >
            ＋新增
          </button>
        </div>
        <div class="input_div">
          <!-- 顏色選擇面版 -->
          <div class="color_select_box" style="">
            <div class=" ">顏色定義：</div>
            <form action="" class="color_select_box_form"></form>
          </div>
          <!-- ///顏色選擇面版 -->
          <v-client-table
            :columns="columns"
            v-model="data"
            :options="options"
            :class="Class_table"
          >
          </v-client-table>
        </div>
        <div
          class="input_div"
          style="position: absolute; width: 80%; bottom: 2rem"
        >
          <table class="Class_table Class_table_new">
            <tr>
              <td>{{ Num }}</td>
              <td>
                <input
                  type="text"
                  v-model="label"
                  placeholder="請輸入欲設定的類別名稱"
                />
              </td>
              <td>
                <div class="Class_color edit_color" @click="edit_color"></div>
              </td>
              <td>
                <button class="tran_btn new_class_btn" @click="addLabel">
                  確定
                </button>
              </td>
            </tr>
          </table>
        </div>
        <div class="" style="position: absolute; width: 80%; bottom: -2rem">
          <button
            class=""
            style="
              border: none;
              background: transparent;
              width: 5rem;
              cursor: pointer;
            "
            @click.prevent="toList"
          >
            <img src="/img/icon/Class_success.png" alt="" style="width: 100%" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import Vue from "vue";
import { ClientTable, Event } from "vue-tables-2";
import UserService from "../../services/user.service";
import VtIndexVue from "../VT/VtIndex.vue";
import VtColorVue from "../VT/VtColor.vue";
import Userinfo from "../../js/getUserinfo";
import newLabel from "../../models/newlabel";
import profile from "../../models/profile.js";

Vue.use(ClientTable); //Client table

let info = new profile("", "", "", "", "");
let check = true;
let errorMSG;
let selectColor = "";
let labelData =
  localStorage.getItem("labelData") === null || undefined
    ? []
    : JSON.parse(localStorage.getItem("labelData"));
//顏色清單
let color_arr = [
  "#ff0000",
  "#ff7f00",
  "#697723",
  "#002266",
  "#7400a1",
  "#483d8b",
  "#990036",
  "#16982b",
  "#4d1f00",
  "#000000",
  "#ff4500",
  "#e29d03",
  "#006400",
  "#0033ff",
  "#9400d3",
  "#6640ff",
  "#cc0080",
  "#22c32e",
  "#8b4513",
  "#696969",
  "#f08080",
  "#ffc82e",
  "#00ff00",
  "#1e90ff",
  "#ff00ff",
  "#9370db",
  "#ff83c7",
  "#98fb98",
  "#cc7722",
  "#c0c0c0",
  "#ffaebe",
  "#fffa00",
  "#e4ff71",
  "#00ffff",
  "#f992ff",
  "#c5afdd",
  "#ffd9e6",
  "#a6ffcc",
  "#ffe4c4",
  "#ffffff",
];
//public顏色
let public_color_arr = [];
let html_str = "";

export default {
  name: "ClassEdit",
  components: {},
  data() {
    return {
      userProfile: info,
      // username: "",
      Num: "",
      label: "",
      columns: ["index", "label", "color"],
      Class_table: "Class_table",
      data: labelData,
      options: {
        headings: {
          index: "編號",
          label: "類別",
          color: "顏色",
        },
        sortable: [""],
        templates: { index: VtIndexVue, color: VtColorVue },
        perPage: 9999999,
        perPageValues: [],
        pagination: false,
        showChildRowToggler: false,
        filterable: false,
        destroyEventBus: true,
      },
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
    //取得資料
    this.getLabeldata();

    //40個顏色input
    for (let i = 0; i <= 3; i++) {
      html_str += '<div class="d-flex justify-content-evenly">';
      for (let j = 1; j <= 10; j++) {
        html_str +=
          '<input type="radio" name="color_selector"  id="color' +
          (i * 10 + j) +
          '" class="color_selector">';
      }
      html_str += "</div>";
    }
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
    //顏色選擇區塊開關
    edit_color() {
      $(".color_select_box").slideToggle();
    },
    //開啟新增類別
    Class_table_new() {
      $(".Class_table_new").slideToggle();
      $("#add_new_class").toggleClass("used_button");
    },
    //轉至使用者資料頁面
    toProfile() {
      this.$router.push("/profile");
    },
    //轉至圖片清單
    toList() {
      this.$router.push("/relay");
    },
    //轉至使用者管理頁面
    toAdmin() {
      this.$router.push("/ctrl/admin");
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
    //取得已設定類別資料
    async getLabeldata() {
      let tempData = [];
      tempData = await UserService.getAdminlabelJson();
      labelData = tempData;
      tempData = JSON.stringify(tempData);
      localStorage.setItem("labelData", tempData);
      this.addPubliclist();
    },
    //新增類別
    async addLabel() {
      let temp;
      errorMSG = "";
      const newlabel = new newLabel(this.label, selectColor);

      check = this.checkForm();

      if (check) {
        temp = await UserService.addAdminlabel(newlabel);
        setTimeout(async () => {
          if (temp._id.length != 0) {
            await ui.alert("類別新增成功!");
            this.getLabeldata();
            // this.Num = "";
            setTimeout(() => {
              this.$router.go(0);
            }, 250);
          } else {
            await ui.alert("類別新增失敗!");
          }
        }, 250);
      } else {
        await ui.alert(errorMSG);
      }
    },
    //添加已使用顏色
    addPubliclist() {
      public_color_arr.length = 0;
      for (const key in labelData) {
        if (labelData.hasOwnProperty.call(labelData, key)) {
          const color = labelData[key]["color"];
          public_color_arr.push(color);
        }
      }
      this.Num = public_color_arr.length + 1 + ".";
      this.lockColor();
    },
    //鎖定已被使用顏色
    lockColor() {
      $(".color_select_box_form").html(html_str);
      //塞入40種顏色+判斷顏色是否使用過
      for (let i = 1; i <= 40; i++) {
        $("#color" + i).css("background", color_arr[i - 1]);
        $("#color" + i).attr("data-color", color_arr[i - 1]);
        //去掉已有顏色
        for (let j = 1; j <= public_color_arr.length; j++) {
          if (color_arr[i - 1] == public_color_arr[j - 1]) {
            $("#color" + i).prop("disabled", true);
          }
        }
      }
      for (let i = 1; i <= public_color_arr.length; i++) {
        $("#color_public" + i).css("background", public_color_arr[i - 1]);
        $("#color_public" + i).attr("data-color", public_color_arr[i - 1]);
      }
      //選了顏色自己關起來
      $(".color_selector")
        .unbind("click")
        .bind("click", function () {
          let getcolor = $(this).data("color");
          selectColor = getcolor;
          $(".edit_color").css("background", getcolor);
          $(".color_select_box").hide();
        });
    },
    //判斷內容是否正確
    checkForm() {
      if (this.label == "") {
        errorMSG = "請輸入類別名稱";
        return false;
      }
      if (selectColor == "") {
        errorMSG = "請選擇類別顏色";
        return false;
      }
      return true;
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
