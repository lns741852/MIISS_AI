import axios from 'axios';

import API from '../js/API'

const API_URL = API(API_URL) + "8088"

class AuthService {
  //登入
  login(user) {
    // if (user.password.indexOf("12345678")) {
    //   localStorage.setItem("RetrievePW", true)
    //   console.log("RetrievePW!");
    // }
    return axios
      .post(API_URL + '/signin', {
        account: user.account,
        password: user.password
      })
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  //登出，並清除localStorage
  logout() {
    let api = localStorage.getItem('API_URL')
    localStorage.clear();
    // localStorage.setItem('API_URL', api)
    console.log("Logout");
  }
}

export default new AuthService();