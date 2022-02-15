<template>
  <div class="Case">
    <div class="filename Casefilename">
      <label>{{ filename }}</label>
    </div>
    <div class="case">
      <iframe :src="srcURL" id="painter" name="painter" ref="painter"></iframe>
    </div>
  </div>
</template>

<script>
import FileSaver from "file-saver";
import moment from "moment";
import UserService from "../../services/user.service";
import API from "../../js/API";
import userService from "../../services/user.service";

let caseName;
let User;
let token;
let caseJson = new Array(0);
let textJSON = new Array(0);
let msgJSON = new Array(0);
const painterURL =
  location.protocol + "//" + location.hostname + ":" + location.port + "/painter.html";
let featureList = new Array(0);
let labelData = new Array(0);
let idList = new Array(0);
let removeList = new Array(0);
let workFlag = true;

const API_URL = API(API_URL) + "8088";

Array.prototype.equals = function (getArray) {
  if (this.length != getArray.length) return false;

  for (let i = 0; i < getArray.length; i++) {
    if (this[i] instanceof Array && getArray[i] instanceof Array) {
      if (!this[i].equals(getArray[i])) return false;
    } else if (this[i] != getArray[i]) {
      return false;
    }
  }
  return true;
};

export default {
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    getselectFile() {
      return this.$store.state.selectFile;
    },
  },
  data() {
    return {
      filename: "",
      srcURL: painterURL, //測試用
    };
  },
  mounted() {
    //監控是否登入
    if (!this.currentUser) {
      this.$router.push("/login");
    }
    //網路測試
    this.testFunction();
    //參數設定
    this.setUser(User);
    this.filename = this.setFileName(this.filename);
    //確認是否有帶入檔案名
    this.checkNamed(this.filename);
    //取得資料並設置
    this.getCaseJson();
    this.getLabeldata();
    //監控繪圖頁面是否傳入請求
    window.addEventListener("message", this.handleMessage);
  },
  methods: {
    /**登出*/
    logOut() {
      this.$store.dispatch("auth/logout");
      this.$router.push("/login");
    },
    /** 返回清單頁面 */
    toList() {
      this.$router.push("/relay");
    },
    /** 確認是否選取檔案 */
    async checkNamed(name) {
      if (name.indexOf("尚未選取任何檔案") != -1) {
        await ui.alert("請選取檔案再進入本頁面");
        this.$router.push("/List");
      }
    },
    /** 設定使用者名稱 */
    setUser() {
      token = this.currentUser.accessToken;
      localStorage.setItem("accessToken", JSON.stringify(token));
    },
    /** 設定檔案名稱至localStorage */
    setFileName(Name) {
      Name = this.getselectFile;
      caseName = Name;
      localStorage.setItem("caseName", JSON.stringify(caseName));
      return Name;
    },
    /** 接收來自繪圖頁面的請求 */
    async handleMessage(event) {
      const data = event.data;
      switch (data.cmd) {
        case "getNewcaseJSON":
          this.getNewcaseJson();
          break;
        case "returnCaseJSON":
          workFlag = false;
          this.updataCaseJson();
          this.outputJSONfile();
          break;
        case "postAetherAIJSON":
          workFlag = false;
          this.updataCaseJson();
          this.postAetherAIData();
          break;
        case "returnCaseJSON_imm":
          if (workFlag) {
            workFlag = false;
            this.updataCaseJson();
          }
          break;
        case "error":
          let ERM = localStorage.getItem("ERM");
          if (ERM != "") {
            if (ERM.indexOf("401") != -1) {
              await ui.alert("登入已逾時，請重新登入");
              this.logOut();
              this.$router.push("/login");
            } else if (ERM.indexOf("403") != -1) {
              await ui.alert(
                "伺服器拒絕執行請求，可能原因為權限不足，如果持續發生請回報\n錯誤碼:" +
                  ERM
              );
              this.logOut();
              this.$router.push("/login");
            } else if (ERM.indexOf("404") != -1) {
              await ui.alert("伺服器發生錯誤，如果持續發生請回報\n錯誤碼:" + ERM);
            } else if (ERM.indexOf("500") != -1) {
              await ui.alert("伺服器發生例外，如果持續發生請回報\n錯誤碼:" + ERM);
            } else if (ERM.indexOf("503") != -1) {
              await ui.alert(
                "伺服器過載，請稍後再重新執行動作，如果持續發生請回報\n錯誤碼:" + ERM
              );
            } else if (ERM.indexOf("504") != -1) {
              await ui.alert(
                "伺服器發生錯誤，如果持續發生請回報\n錯誤碼:" + ERM + " Gateway Timeout"
              );
            } else {
              await ui.alert("伺服器發生錯誤，如果持續發生請回報\n錯誤碼:" + code);
            }
          }
          this.toList();
          break;
        case "returnList":
          if (await ui.confirm("即將離開標註頁面，是否確認?")) {
            this.toList();
          }
          break;
      }
    },
    /** 取得JSON */
    async getCaseJson() {
      caseJson = await UserService.getCasejson(caseName);
      if (caseJson.length != 0) {
        caseJson = await this.formatJson(caseJson);
      }
    },
    /** JSON調整-標註頁面用(初次載入使用) */
    formatJson(json) {
      let temp;
      let tempID = 0;
      let tempJson = new Array(0);
      let tempTextJSON = new Array(0);
      let tempFeatureList = new Array(0);
      let tempTextList = new Array(0);
      let tempMSGjson = new Array(0);

      for (const key in json) {
        if (json.hasOwnProperty(key)) {
          const feature = json[key];
          let feature_type = feature["type"];
          let feature__id = feature["_id"];
          let feature_id = feature["id"];
          let feature_color =
            feature["color"] && feature["color"] != undefined
              ? feature["color"]
              : "#000000";
          let feature_message =
            feature["message"] && feature["message"] != undefined
              ? feature["message"]
              : "";
          let feature_coordinates = feature["coordinates"];
          switch (feature_type) {
            case "Text": {
              temp = {
                type: feature_type,
                value: feature_message,
                coordinates: feature_coordinates,
                id: feature_id,
              };
              tempTextList.push(temp);
              featureList.push({
                _id: feature__id,
                id: feature_id,
                type: feature_type,
                value: feature_message,
                coordinates: feature_coordinates,
              });
              if (feature_id > tempID) {
                tempID = feature_id;
              }
              break;
            }
            default:
              temp = {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: feature_coordinates,
                },
                properties: {
                  hexCode: feature_color,
                  geometryfeature: feature_type,
                },
                id: feature_id,
              };
              tempFeatureList.push(temp);
              featureList.push({
                _id: feature__id,
                id: feature_id,
                type: feature_type,
                color: feature_color,
                message: feature_message,
                coordinates: feature_coordinates,
              });
              tempMSGjson.push({
                _id: feature__id,
                id: feature_id,
                message: feature_message,
              });
              if (feature_id > tempID) {
                tempID = feature_id;
              }
              break;
          }
          idList.push({
            id: feature_id,
            _id: feature__id,
          });
        }
      }
      tempJson = {
        type: "FeatureCollection",
        features: tempFeatureList,
      };
      removeList = Array.from(idList);
      tempJson = JSON.stringify(tempJson);
      tempTextJSON = JSON.stringify(tempTextList);
      tempMSGjson = JSON.stringify(tempMSGjson);
      localStorage.setItem("id", parseInt(tempID) + 1);
      localStorage.setItem("featuresJson", tempJson);
      localStorage.setItem("textJSON", tempTextJSON);
      localStorage.setItem("msgJSON", tempMSGjson);
    },
    /** JSON調整-上傳至後端 */
    async updataCaseJson() {
      caseJson = JSON.parse(localStorage.getItem("caseJson"));
      textJSON = JSON.parse(localStorage.getItem("textJSON"));
      msgJSON = JSON.parse(localStorage.getItem("msgJSON"))
        ? JSON.parse(localStorage.getItem("msgJSON"))
        : new Array(0);
      const tempJson = caseJson["features"];
      let sendObj;

      // console.log("updataCaseJson ", msgJSON);

      //取得類別資料
      await this.getLabeldata();
      //標註處理
      for (const key in tempJson) {
        if (tempJson.hasOwnProperty(key)) {
          let repeatCheck = false;
          let res;
          const feature_attrs = tempJson[key];
          let feature_id = tempJson[key]["id"] != null ? tempJson[key]["id"] : "";

          let feature__id =
            this.getfeatureid(feature_id) != undefined
              ? this.getfeatureid(feature_id)
              : "";

          const jsonCheck = this.checkJSON(feature_attrs);
          if (jsonCheck) {
            //確認是否為重複標註
            repeatCheck = this.doRepeatcheck(feature__id, feature_attrs);
            // console.log("doRepeatcheck :", repeatCheck, feature__id, feature_attrs);
            if (repeatCheck) {
              //判別是否為新標註
              if (feature__id == "") {
                sendObj = this.newfeature(feature_attrs);
                if (sendObj != "") {
                  console.log("新標註:", sendObj);
                  res = await UserService.sendCasejson(sendObj);
                  this.newfeaturesave(res);
                }
              } else {
                sendObj = this.updatafeature(feature_id, feature_attrs);
                if (sendObj != "") {
                  this.removeId(feature__id, removeList);
                  console.log("標註更新:", feature__id, sendObj);
                  UserService.putCasejson(feature__id, sendObj);
                }
              }
            }
          }
        }
      }
      //文字處理
      for (const key in textJSON) {
        if (Object.hasOwnProperty.call(textJSON, key)) {
          let repeatCheck = false;
          let res;
          const text_attrs = textJSON[key];
          let text_id = textJSON[key]["id"] != null ? textJSON[key]["id"] : "";

          let text__id =
            this.getfeatureid(text_id) != undefined ? this.getfeatureid(text_id) : "";

          const textCheck = this.checkText(text_attrs);
          // console.log("textCheck:", textCheck);
          if (textCheck) {
            //確認是否為重複標註
            repeatCheck = this.doRepeatcheck(text__id, text_attrs);
            // console.log("doRepeatcheck :", repeatCheck, text__id, text_attrs);
            if (repeatCheck) {
              //判別是否為新標註
              if (text__id == "") {
                sendObj = this.newfeature(text_attrs);
                if (sendObj != "") {
                  console.log("newText:", sendObj);
                  res = await UserService.sendCasejson(sendObj);
                  this.newfeaturesave(res);
                }
              } else {
                sendObj = this.updatafeature(text__id, text_attrs);
                if (sendObj != "") {
                  this.removeId(text__id, removeList);
                  console.log("文字更新:", text__id, sendObj);
                  UserService.putCasejson(text__id, sendObj);
                }
              }
            }
          }
        }
      }
      //移除已被刪除的標註及文字
      console.log("doDELlist:", removeList);
      this.delId();
      this.rebuildList();
      setTimeout(() => {
        workFlag = true;
      }, 100);
    },
    /** 取得已設定類別資料 */
    async getLabeldata() {
      let tempData = [];
      tempData = await UserService.getAdminlabelJson();
      for (const key in tempData) {
        if (tempData.hasOwnProperty.call(tempData, key)) {
          const element = tempData[key];
          labelData.push(element);
        }
      }
      tempData = await UserService.getUserlabelJson();
      if (tempData.length != 0) {
        for (const key in tempData) {
          if (tempData.hasOwnProperty.call(tempData, key)) {
            const element = tempData[key];
            labelData.push(element);
          }
        }
      }
    },
    /** 取得顏色對應Label */
    getLabel(color) {
      for (const key in labelData) {
        if (labelData.hasOwnProperty.call(labelData, key)) {
          const element_color = labelData[key]["color"];
          const element_Label = labelData[key]["label"];
          if (element_color == color) {
            return element_Label;
          }
        }
      }
      return color;
    },
    //檢測是否含有不應存在的值(NULL)
    checkJSON(attrs) {
      const feature_coordinates = attrs["geometry"]["coordinates"];
      const feature_geometryfeature = attrs["properties"]["geometryfeature"];
      if (feature_coordinates == "" || feature_geometryfeature == "") {
        return false;
      }
      return true;
    },
    //檢測是否含有不應存在的值(NULL)
    checkText(attrs) {
      const text_coordinates = attrs["coordinates"];
      const text_value = attrs["value"];
      if (text_coordinates == "" || text_value == "") {
        return false;
      }
      return true;
    },
    /** 取得ID */
    getfeatureid(id) {
      let _id = "";
      for (const key in idList) {
        if (Object.hasOwnProperty.call(idList, key)) {
          const il_id = idList[key]["id"];
          const il__id = idList[key]["_id"];
          if (id == il_id) {
            _id = il__id;
            // console.log("getfeatureid", _id);
            return _id;
          }
        }
      }
    },
    /** 識別標註與文字是否完全重複 */
    doRepeatcheck(_id, attrs) {
      let check = false;
      // console.log("doRepeatcheck", _id, attrs);
      if (_id == "") {
        check = true;
      } else {
        this.removeId(_id, removeList);
        if (attrs["type"] == "Text") {
          check = this.checkTextList(_id, attrs);
        } else {
          check = this.checkFeature(_id, attrs);
        }
      }
      return check;
    },
    /** 標註重複檢查 */
    checkFeature(attrs__id, attrs) {
      const attrs_id = attrs["id"];
      const attrs_type =
        !attrs["properties"]["geometryfeature"] ||
        attrs["properties"]["geometryfeature"] != undefined
          ? attrs["properties"]["geometryfeature"]
          : attrs["properties"]["geometryShape"];
      const attrs_color =
        attrs["properties"]["hexCode"] && attrs["properties"]["hexCode"] != undefined
          ? attrs["properties"]["hexCode"]
          : "#000000";
      const attrs_coordinates = attrs["geometry"]["coordinates"];
      const featureIndex = this.idIndex(attrs__id, featureList);
      const msgIndex = this.idIndex(attrs_id, msgJSON);
      const attr_msg = featureIndex != -1 ? featureList[featureIndex]["message"] : "";
      const feature_msg = msgIndex != -1 ? msgJSON[msgIndex]["message"] : "";
      const feature_id = featureList[featureIndex]["id"];
      const feature__id = featureList[featureIndex]["_id"];
      const feature_type = featureList[featureIndex]["type"];
      const feature_color = featureList[featureIndex]["color"];
      const feature_coordinates = featureList[featureIndex]["coordinates"];

      /* console.log(
        "checkFeature :",
        "\n attrs :",
        "attr ",attr_msg ,"ft ", feature_msg ,
        attr_msg==feature_msg
      ); */

      if (
        attrs_coordinates.equals(feature_coordinates) &&
        attr_msg == feature_msg &&
        attrs_id == feature_id &&
        attrs__id == feature__id &&
        attrs_type == feature_type &&
        attrs_color == feature_color
      ) {
        return false;
      }

      if (attrs__id != "") {
        this.removeId(attrs__id, featureList);
        featureList.push({
          _id: attrs__id,
          id: attrs_id,
          type: attrs_type,
          message: feature_msg,
          color: attrs_color,
          coordinates: attrs_coordinates,
        });
      }
      return true;
    },
    /** 文字檢查是否重複 */
    checkTextList(attrs__id, attrs) {
      const attrs_id = attrs["id"];
      const attrs_value = attrs["value"];
      const attrs_coordinates = attrs["coordinates"];
      const featureIndex = this.idIndex(attrs__id, featureList);
      const feature_id = featureList[featureIndex]["id"];
      const feature__id = featureList[featureIndex]["_id"];
      const feature_type = featureList[featureIndex]["type"];
      const feature_value = featureList[featureIndex]["value"];
      const feature_coordinates = featureList[featureIndex]["coordinates"];

      if (
        attrs_coordinates.equals(feature_coordinates) &&
        attrs_id == feature_id &&
        attrs__id == feature__id &&
        feature_type == "Text" &&
        attrs_value == feature_value
      ) {
        return false;
      }

      if (attrs__id != "") {
        this.removeId(attrs__id, featureList);
        featureList.push({
          _id: attrs__id,
          id: attrs_id,
          type: "Text",
          value: attrs_value,
          coordinates: attrs_coordinates,
        });
      }
      return true;
    },
    /** 構成新標註 */
    newfeature(attrs) {
      let tempData;
      let feature_id = attrs["id"];
      let feature_type;
      let feature_color;
      let feature_value;
      let feature_coordinates;
      if (attrs["type"] != "Text") {
        feature_type = attrs["properties"]["geometryShape"];
        feature_color = attrs["properties"]["hexCode"];
        feature_coordinates = attrs["geometry"]["coordinates"];
      } else {
        feature_type = attrs["type"];
        feature_value = attrs["value"];
        feature_color = attrs["hexCode"];
        feature_coordinates = attrs["coordinates"];
      }
      let feature_Label = this.getLabel(feature_color);
      if (feature_type == undefined) {
        feature_type = "Feature";
      }
      switch (feature_type) {
        case "Text": {
          tempData = {
            coordinates: feature_coordinates,
            id: feature_id,
            type: feature_type,
            message: feature_value,
            color: feature_color,
            host: caseName,
          };
          break;
        }
        default:
          tempData = {
            coordinates: feature_coordinates,
            id: feature_id,
            type: feature_type,
            label: feature_Label,
            color: feature_color,
            host: caseName,
          };
          break;
      }
      return tempData;
    },
    /** 構成更新標註 */
    updatafeature(id, attrs) {
      let tempData;
      let feature_type;
      let feature_color;
      let feature_value;
      let feature_coordinates;
      if (attrs["type"] != "Text") {
        feature_type = attrs["properties"]["geometryShape"];
        feature_color = attrs["properties"]["hexCode"];
        feature_coordinates = attrs["geometry"]["coordinates"];
      } else {
        feature_type = attrs["type"];
        feature_value = attrs["value"];
        feature_color = attrs["hexCode"];
        feature_coordinates = attrs["coordinates"];
      }
      let feature_Label = this.getLabel(feature_color);
      const msgIndex = this.idIndex(id, msgJSON);
      const feature_msg = msgIndex != -1 ? msgJSON[msgIndex]["message"] : "";

      // console.log(msgJSON, id, msgIndex, feature_msg);

      switch (feature_type) {
        case "Text": {
          tempData = {
            coordinates: feature_coordinates,
            message: feature_value,
            label: feature_Label,
            color: feature_color,
          };
          break;
        }
        default:
          tempData = {
            coordinates: feature_coordinates,
            label: feature_Label,
            color: feature_color,
            message: feature_msg,
          };
          break;
      }
      return tempData;
    },
    /** 新標註紀錄儲存 */
    newfeaturesave(res) {
      let tempMSGjson = JSON.parse(localStorage.getItem("msgJSON"));
      const res__id = res["_id"];
      const res_id = res["id"];
      const type = res["type"];
      const color = res["color"];
      const message = res["message"];
      const coordinates = res["coordinates"];
      if (type != "Text") {
        featureList.push({
          _id: res__id,
          id: res_id,
          type: type,
          color: color,
          message: "",
          coordinates: coordinates,
        });
      } else {
        featureList.push({
          _id: res__id,
          id: res_id,
          type: type,
          value: message,
          coordinates: coordinates,
        });
      }
      idList.push({
        id: res_id,
        _id: res__id,
      });
      tempMSGjson = tempMSGjson || [];
      tempMSGjson.push({
        _id: res__id,
        id: res_id,
        message: "",
      });
      tempMSGjson = JSON.stringify(tempMSGjson);
      localStorage.setItem("msgJSON", tempMSGjson);
      // console.log("newfeaturesave : ", featureList, idList);
    },
    /** 輸出JSON */
    async outputJSONfile() {
      let tempData = [];
      let tempFeature = [];
      let Data = localStorage.getItem("caseJson_transform");
      let size = localStorage.getItem("size");
      let date = new Date();
      const saveFilename = caseName + " " + moment(date).format("YYYY-MM-DD") + ".json";

      try {
        if (Data == undefined || Data == null) {
          Data = [];
        } else {
          Data = JSON.parse(Data)["features"];
        }

        size = JSON.parse(size);

        Data.forEach((feature) => {
          let feature_id = feature["id"];
          let feature_color = feature["properties"]["hexCode"];
          const msgIndex = this.idIndex(feature_id, msgJSON);
          const feature_msg = msgIndex != -1 ? msgJSON[msgIndex]["message"] : "";
          let feature_coordinates = feature["geometry"]["coordinates"][0];
          let tempCoordinates = [];
          let v_x = feature_coordinates[0][0];
          let v_y = feature_coordinates[0][1];
          let v_x2 = feature_coordinates[0][0];
          let v_y2 = feature_coordinates[0][1];
          let v_w = 0;
          let v_h = 0;

          try {
            feature_coordinates.forEach((coordinat) => {
              v_x = coordinat[0] < v_x ? coordinat[0] : v_x;
              v_y = coordinat[1] > v_y ? coordinat[1] : v_y;
              v_x2 = coordinat[0] > v_x2 ? coordinat[0] : v_x2;
              v_y2 = coordinat[1] < v_y2 ? coordinat[1] : v_y2;
              tempCoordinates.push([coordinat[0], Math.abs(coordinat[1])]);
            });

            v_w = Math.abs(Math.abs(v_x) - Math.abs(v_x2));
            v_h = Math.abs(Math.abs(v_y) - Math.abs(v_y2));

            tempFeature.push({
              type: feature["properties"]["geometryfeature"],
              label: this.getLabel(feature_color),
              color: feature["properties"]["hexCode"],
              label_name: feature_id,
              segments: tempCoordinates,
              viewport_x: Math.abs(v_x),
              viewport_y: Math.abs(v_y),
              viewport_width: Math.abs(v_w),
              viewport_height: Math.abs(v_h),
              message: feature_msg,
            });
          } catch (error) {
            alert(error);
          }
        });

        tempData.push({
          slide_name: caseName,
          width: Math.abs(size["width"]),
          height: Math.abs(size["height"]),
          targets: tempFeature,
        });

        tempData = JSON.stringify(tempData);
        const blob = new Blob([tempData], { type: "" });
        FileSaver.saveAs(blob, saveFilename);
        await ui.alert("已儲存並輸出至檔案:\n", saveFilename);
      } catch (error) {
        await ui.alert("輸出發生錯誤!", error);
      }
    },
    /** 輸出資料至雲象 */
    async postAetherAIData() {
      let tempAIdata;
      let tempTargets = [];
      let Data = localStorage.getItem("caseJson_transform");
      let size = localStorage.getItem("size");

      try {
        if (Data == undefined || Data == null) {
          Data = [];
        } else {
          Data = JSON.parse(Data)["features"];
        }

        size = JSON.parse(size);

        Data.forEach((feature) => {
          let feature_coordinates = feature["geometry"]["coordinates"][0];
          let tempCoordinates = [];
          let v_x = feature_coordinates[0][0];
          let v_y = feature_coordinates[0][1];
          let v_x2 = feature_coordinates[0][0];
          let v_y2 = feature_coordinates[0][1];
          let v_w = 0;
          let v_h = 0;

          try {
            feature_coordinates.forEach((coordinat) => {
              v_x = coordinat[0] < v_x ? coordinat[0] : v_x;
              v_y = coordinat[1] > v_y ? coordinat[1] : v_y;
              v_x2 = coordinat[0] > v_x2 ? coordinat[0] : v_x2;
              v_y2 = coordinat[1] < v_y2 ? coordinat[1] : v_y2;
              tempCoordinates.push([coordinat[0], Math.abs(coordinat[1])]);
            });

            v_w = Math.abs(Math.abs(v_x) - Math.abs(v_x2));
            v_h = Math.abs(Math.abs(v_y) - Math.abs(v_y2));

            tempTargets.push({
              segments: tempCoordinates,
              viewport_x: Math.abs(v_x),
              viewport_y: Math.abs(v_y),
              viewport_width: Math.abs(v_w),
              viewport_height: Math.abs(v_h),
              label_name: null,
            });
          } catch (error) {
            alert(error);
          }
        });

        tempAIdata = {
          slide_name: "label_testing",
          ai_project: 61,
          width: Math.abs(size["width"]),
          height: Math.abs(size["height"]),
          targets: tempTargets,
        };

        let resData = await userService.toAetherAIData(tempAIdata);
        if (resData.id) {
          await ui.alert("已儲存並輸出至雲象科技");
        } else {
          await ui.alert("輸出失敗，");
        }
      } catch (error) {
        await ui.alert("輸出發生錯誤!", error);
      }
    },
    /** 從陣列移除特定id */
    removeId(id, list) {
      let index = this.idIndex(id, list);
      if (index != -1) {
        list.splice(index, 1);
        // console.log("removeId :", id, index, list);
      }
    },
    /** 取得特定id在陣列的位置 */
    idIndex(id, list) {
      let index = -1;
      if (!isNaN(id)) {
        for (const key in list) {
          if (Object.hasOwnProperty.call(list, key)) {
            const list_id = list[key]["id"];
            if (id == list_id) {
              index = key;
              return index;
            }
          }
        }
      } else {
        for (const key in list) {
          if (Object.hasOwnProperty.call(list, key)) {
            const list_id = list[key]["_id"];
            if (id == list_id) {
              index = key;
              return index;
            }
          }
        }
      }
      return index;
    },
    /** 移除removeList中的id */
    delId() {
      // console.log("delID : ", removeList);
      for (const key in removeList) {
        if (removeList.hasOwnProperty.call(removeList, key)) {
          const id = removeList[key]["_id"];
          UserService.delCaseID(id);
        }
      }
    },
    /** 重置removeList */
    rebuildList() {
      for (const key in removeList) {
        if (removeList.hasOwnProperty.call(removeList, key)) {
          const _id = removeList[key]["_id"];
          this.removeId(_id, idList);
          this.removeId(_id, featureList);
        }
      }
      removeList = Array.from(idList);
      // console.log("rebuildList:", idList, removeList);
    },
    /** 網路測試 */
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
  /** 離開此頁面執行的動作 */
  beforeDestroy() {
    window.removeEventListener("message", this.handleMessage);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("caseName");
    localStorage.removeItem("filePath");
    localStorage.removeItem("id");
    localStorage.removeItem("featuresJson");
    localStorage.removeItem("msgJSON");
    localStorage.removeItem("textJSON");
    localStorage.removeItem("caseJson");
    localStorage.removeItem("ERM");
    sessionStorage.clear();
    idList.length = 0;
    removeList.length = 0;
    featureList.length = 0;
    msgJSON.length = 0;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../../assets/css/base.css";
@import "../../assets/css/font.css";
@import "../../assets/css/case.css";
</style>
