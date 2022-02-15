import axios from 'axios';
import authHeader from './auth-header';
import API from '../js/API'

const API_URL = API(API_URL) + "8088"
const API_URL_O = API(API_URL)
let user = JSON.parse(localStorage.getItem('user'));

class UserService {
  //取得個人資訊
  async getUserInfo() {
    const data = await axios.get(API_URL + '/info', {
        headers: authHeader()
      })
      .then(res => res.data)
    return data
  }

  //修改個人資訊
  async putUserInfo(userProfile) {
    let data = {
      "username": userProfile.username,
      "password": userProfile.password,
      "email": userProfile.email,
      "phone": userProfile.phone,
    }

    if (!userProfile.password) {
      data = {
        "username": userProfile.username,
        "email": userProfile.email,
        "phone": userProfile.phone,
      }
    }
    await axios.put(API_URL + '/info', data, {
        headers: authHeader()
      })
      .then(response => {
        if (response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(response.data));
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(error.response.data));
        }
        return error.response.data;
      })
  }

  //修改個人密碼
  async putUserPW(userProfile) {
    await axios.put(API_URL + '/info', {
        "password": userProfile.password
      }, {
        headers: authHeader()
      })
      .then(response => {
        if (response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(response.data));
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(error.response.data));
        }
        return error.response.data;
      })
  }

  //新增帳號
  async AddAccess(user) {
    let statusCode = null;
    let code = null;
    await axios.post(API_URL + '/users', {
        "account": user.account,
        "username": user.username,
        "password": user.password,
        "division": user.division,
        "email": user.email,
        "phone": user.phone,
      }, {
        headers: authHeader()
      })
      .then(response => {
        if (response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(response.data));
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(error.response.data));
        }
        return error.response.data;
      });
  }

  //帳號狀態修改
  async EnableAccess(id, flag) {
    await axios.put(API_URL + '/users/' + id, {
        "activation": flag
      }, {
        headers: authHeader()
      })
      .then(response => {
        if (response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(response.data));
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(error.response.data));
        }
        return error.response.data;
      })
  }

  //刪除帳號
  async DeleteAccess(id) {
    await axios.delete(API_URL + '/users/' + id, {
        headers: authHeader()
      })
      .then(response => {
        if (response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(response.data));
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(error.response.data));
        }
        return error.response.data;
      })
  }

  //修改個人資料(管理者)
  async ModifyAccess(id, profile) {
    await axios.put(API_URL + '/users/' + id, {
        "username": profile.username,
        "division": profile.division,
        "email": profile.email,
        "phone": profile.phone,
      }, {
        headers: authHeader()
      })
      .then(response => {
        if (response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(response.data));
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(error.response.data));
        }
        return error.response.data;
      })
  }

  //重置密碼
  async ReSetPW(id) {
    await axios.
    put(API_URL + '/users/reset/' + id, {}, {
        headers: authHeader()
      })
      .then(response => {
        if (response.data.password) {
          localStorage.setItem('pw', JSON.stringify(response.data));
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response.data.message) {
          localStorage.setItem('MSG', JSON.stringify(error.response.data));
        }
        return error.response.data;
      })
  }

  //取得使用者清單
  async getUserslist() {
    const data = await axios.
    get(API_URL + '/users', {
        headers: authHeader()
      })
      .then(res => res.data)
    return data
  }

  //取得類別顏色清單(管理者)
  async getAdminlabelJson() {
    const data = await axios.
    get(API_URL + '/adminLabel', {
        headers: authHeader()
      })
      .then(res => res.data)
    return data
  }

  //新增類別顏色(管理者)
  async addAdminlabel(newlabel) {
    const data = await axios.
    post(API_URL + '/adminLabel', {
        "label": newlabel.label,
        "color": newlabel.color
      }, {
        headers: authHeader()
      })
      .then(res => res.data)
    return data
  }

  //刪除類別顏色(管理者)
  async delAdminlabel(id) {
    const data = await axios.
    delete(API_URL + '/adminLabel/' + id, {
        headers: authHeader()
      })
      .then(res => res.data)
    return data
  }

  //取得類別顏色清單(使用者)
  async getUserlabelJson() {
    const data = await axios.
    get(API_URL + '/userLabel', {
        headers: authHeader()
      })
      .then(res => res.data)
    return data
  }

  //取得玻片檔案清單(isyntax)
  async getSyntaxlistJson() {
    const data = await axios.
    get(API_URL + '/syntaxList', {
        headers: authHeader()
      })
      .then(res => res.data)
    return data
  }

  //取得玻片資訊清單
  async getListDatajson(list) {
    const data = await axios.
    post(API_URL + '/hostStatus', list, {
        headers: authHeader()
      })
      .then(res => res.data)
    return data
  }

  //向後端取得該檔案的所有標註(以JSON形式)
  async getCasejson(filename) {
    const data = await axios.
    get(API_URL + '/shapes?host=' + filename, {
        headers: authHeader()
      })
      .then(res => res.data)
    return data
  }

  //向後端回傳標註的JSON
  async sendCasejson(caseJson) {
    const data = await axios.post(API_URL + '/shapes', caseJson, {
        headers: authHeader()
      })
      .then(res => res.data);
    return data
  }

  //向後端更新標註的JSON
  putCasejson(id, caseJson) {
    axios.put(API_URL + '/shapes/' + id, caseJson, {
      headers: authHeader()
    });
  }

  //刪除特定id的標註
  delCaseID(id) {
    axios.delete(API_URL + '/shapes/' + id, {
      headers: authHeader()
    });
  }

  //刪除該玻片的"所有"標註
  // delCasejson(filename) {
  //   axios.delete(API_URL + '/shapes?host=' + filename, { headers: authHeader() });
  // }

  /** 轉送標註內容至雲象 */
  async toAetherAIData(jsonData) {
    const data = await axios.post('https://release.aetherai.com/home/viewer/contour_result/add_result', jsonData, {
        headers: {
          "Authorization": "Basic " + window.btoa("wisdom:user_password")
        }
      })
      .then(res => res.data);
    return data
  }

  //網路測試
  async testConnection(code) {
    localStorage.setItem("API_URL", API_URL_O);
    let statusCode = null;
    await axios.get(API_URL + '/info', {
        headers: authHeader()
      })
      .catch(function (error) {
        statusCode = JSON.stringify(error.response.status)
        code = statusCode;
        switch (statusCode) {
          case "401":
            return code
          case "404":
            return code
          case "500":
            return code
          case "503":
            return code
          case "504":
            return code
          default:
            return code
        }
      });
    return code
  }

  //日後取得後端網址的方法
  // async getAPIurl() {
  //   const data = await axios.
  //     get('/API/url.json').then(res => res.data)//發布版需修改成'/MIIS_AI/API/url.json'
  //   for (const key in data) {
  //     if (data.hasOwnProperty(key)) {
  //       const element_url = data[key];
  //       localStorage.setItem('api', element_url)
  //     }
  //   }
  // }
}

export default new UserService();