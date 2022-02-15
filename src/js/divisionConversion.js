export default function reDiv(division) {
    switch (division) {
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
            return division;
    }
}

// export default function API_URL(url) {
//     // apiUrl = localStorage.getItem('api')
//     url = apiUrl
//     return url
// }
