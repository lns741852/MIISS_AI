// let apiUrl = 'https://96f9e7c5f41e.jp.ngrok.io'//測試用
// let apiUrl = 'http://192.168.1.105:'//CGPT_server
// let apiUrl = 'http://61.219.235.222:'//CGPT_server2
// let apiUrl = 'http://192.168.1.43:'//CGPT_server3
let apiUrl = 'http://10.221.252.105:'//裝機用

export default function API_URL(url) {
    // apiUrl = localStorage.getItem('api')
    url = apiUrl
    return url
}
