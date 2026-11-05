# 北教大美食地圖

國立臺北教育大學周邊（118巷、學校對面、學餐、科技大樓站周邊）的美食地圖網站。期中報告：題目自訂。

## 頁面（共 4 頁）
| 檔案 | 用途 |
|---|---|
| `index.html` | 首頁：網站介紹、三個功能入口、本週最高票 |
| `map.html` | 美食地圖：街道底圖、篩選、搜尋、店家簡介與清單 |
| `oracle.html` | 今日吃什麼：天使豬與惡魔豬吵架，聖廚豬端出答案 |
| `rank.html` | 人氣榜與回饋：正餐／飲料／點心每週榜單與「一起補地圖」表單 |

## 資料夾
```
index.html  map.html  oracle.html  rank.html
css/style.css      樣式（字級、色彩、按鈕規格都用變數統一）
js/common.js       共用：選取器、搜尋比對、自製下拉選單
js/data.js         店家資料
js/map.js          地圖、縮放、清單、簡介
js/oracle.js       占卜動畫
js/rank.js         人氣榜、回饋表單
js/home.js         首頁最高票
images/logo.svg    標誌（漢堡）
images/favicon-32.png、apple-touch-icon.png、favicon.ico   分頁小圖示
```

## 使用技術
HTML、CSS、JavaScript（原生，無框架）；SVG 繪製街道底圖與角色；字型 Noto Serif TC、Noto Sans TC。

## 上傳 GitHub Pages
1. 在 GitHub 建立新的 repository（Public），把本資料夾內所有檔案（含 `.nojekyll`）放在根目錄。
2. Settings → Pages → Source 選 `Deploy from a branch`，Branch 選 `main`、資料夾 `/ (root)`。
3. 約一分鐘後網址為 `https://<帳號>.github.io/<repo名稱>/`。

## 備註
人氣榜與回饋表單需要資料庫（Claude Artifact 的 `db` 功能），放在 GitHub Pages 或單獨開啟檔案時，投票與回饋不會運作（榜單顯示空白、送出時顯示「目前無法送出」），其餘功能都可使用。 
