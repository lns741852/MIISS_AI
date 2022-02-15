/** 取得使用者資訊並回傳 */
export default function getUserinfo() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'))
    return userInfo
}