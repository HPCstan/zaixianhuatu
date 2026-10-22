# 線上畫圖網頁版 (zaixianhuatu)

純 HTML/CSS/JavaScript 開發的線上畫圖、線上塗鴉小工具，無後端、無建置流程，整包靜態檔案即可執行。
本專案 fork 自 [geeeeeeeek/zaixianhuatu](https://github.com/geeeeeeeek/zaixianhuatu)，並已完成**繁體中文化（台灣用語）**與 **Cloudflare Pages 部署**。

## 線上預覽

- https://zaixianhuatu.pages.dev/
- 原始版本：http://zaixianhuatu.org

---

## 本次修改說明

### 一、修改原因

| # | 問題 | 影響 |
|---|------|------|
| 1 | 全站為**簡體中文** | 台灣使用者閱讀障礙 |
| 2 | 用語為中國大陸習慣（在線、鼠標、默認、打印…） | 台灣使用者覺得不自然，也影響 SEO 關鍵字命中 |
| 3 | 專案**混用多種文字編碼**（UTF-8 BOM 與 GBK 混雜） | 直接批次替換會產生亂碼；`index.html` 甚至用 `<script charset="gb2312">` 指定子檔編碼 |
| 4 | 原始部署說明為「VPS + nginx」 | 與實際採用的 Cloudflare Pages 不符 |
| 5 | 頁面缺少 `<meta charset>` | 在無 HTTP charset 標頭的環境（例如本機直接開檔）會亂碼 |

### 二、修改做法

#### 1. 繁體轉換：OpenCC 兩階段

先 `s2t`（字形轉換），再 `s2twp`（台灣詞彙轉換），不用一次到位的 `s2twp`，是因為分階段比較容易驗證與回退：

| 階段 | 轉換器 | 目的 | 範例 |
|------|--------|------|------|
| 第一階段 | `s2t` | 只改字形，不動詞彙，確保語意零風險 | 在线 → 在線 |
| 第二階段 | `s2twp` | 套用台灣慣用詞 | 在線 → 線上、視圖 → 檢視、鼠標 → 滑鼠 |

轉換只作用在 CJK 字元與字串／註解，JS 語法、變數名稱、HTML 標籤、檔案路徑完全未動。

#### 2. 編碼修正（關鍵：不做這步一定亂碼）

- **4 個 GBK 檔案**先以 `gb18030` 解碼，再以 UTF-8 重新寫出：
  `JScript/jquery-easyui/themes/icon.css`、`JScript/Mousetrap/test.html`、`JScript/RulersGuides/Dragdrop.js`、`JScript/RulersGuides/RulersGuides.js`
- **`index.html` 3 處 `<script charset="gb2312">` → `charset="utf-8"`**：否則這 3 個外部 JS 會被瀏覽器以 GBK 解讀而變亂碼
- **4 個 HTML 補上 `<meta charset="utf-8"/>`**：`Help.htm`、`About.htm`、`SelectImg.html`、`Mousetrap/test.html`
- 原有 UTF-8 BOM 一律保留，避免編輯器再次誤判編碼

#### 3. 台灣用語對照表（OpenCC 未涵蓋者以人工補正）

| 原（簡體／大陸用語） | 改為（台灣用語） | 出現次數 |
|--------|----------|----------|
| 在线画图 | 線上畫圖 | 8 |
| 帮助 | 說明 | 7 |
| 视图 | 檢視 | 3 |
| 窗口 | 視窗 | 7 |
| 另存为 | 另存新檔 | 5 |
| 选择所有 | 全選 | 2 |
| 退出 | 結束 | 12 |
| 全屏 | 全螢幕 | 4 |
| 获取 | 取得 | 48 |
| 协同操作 | 協同作業 | 56 |
| 请稍待 | 請稍候 | 1 |

OpenCC `s2twp` 自動處理（含出現次數）：影像（圖像）46、滑鼠（鼠標）15、預設（默認）8、列印（打印）3、儲存（保存）28、支援（支持）3、軟體（軟件）1、載入（加載）2、剪下（剪切）2、貼上（粘貼）2、欄位（字段）1、檔案（文件）8。

刻意**保留不動**：`新建`、`確定`、`取消`、`撤銷`、`重做`、`說明文件`（兩地通用或台灣亦有此說法）。

### 三、影響檔案

共 17 個檔案（`main.js` 約 9,200 個中文字、`index.html` 約 900 個）：

```
index.html
CSS/main.css
Code/About.htm  Code/Help.htm  Code/SelectImg.html  Code/readme.txt
JScript/CodeJS/changeTheme.js  fullscreen.js  keypressEvent.js  main.js  readme.txt
JScript/jpicker-1.1.6/jpicker-1.1.6.js
JScript/jquery-easyui/easyui-lang-zh_CN.js
JScript/jquery-easyui/themes/icon.css
JScript/Mousetrap/test.html
JScript/RulersGuides/Dragdrop.js  RulersGuides.js
```

### 四、驗證方式

1. **JS 語法**：13 個 JS 檔全部 `node --check` 通過（確認只改字串／註解，未破壞程式結構）
2. **轉換收斂**：對輸出再跑一次 OpenCC，差異為 0（確認無殘留簡體字）
3. **線上檔案比對**：直接抓正式站檔案，確認 `在線／視圖／窗口／幫助／鼠標／默認／打印／保存` 等出現 0 次
4. **視覺驗證**：Chrome headless 實際渲染截圖，確認選單列為 `檔案 編輯 影像 圖層 效果 檢視 視窗 說明`，無亂碼

---

## 部署（Cloudflare Pages）

本專案為純靜態網站，不需要建置步驟，直接把整包目錄上傳即可。

```bash
# 首次建立專案（只需一次）
npx wrangler pages project create zaixianhuatu --production-branch master

# 部署
npx wrangler pages deploy <靜態檔案目錄> --project-name zaixianhuatu --branch master
```

- 正式網址：https://zaixianhuatu.pages.dev/
- 建議上傳前先複製一份乾淨目錄，**排除 `.git` 與 `README.md`**（`wrangler pages deploy` 會照目錄內容原樣上傳）

### 更新流程

```bash
# 1. 改動原始碼後，重新產生乾淨的發佈目錄（排除 .git / README.md）
# 2. 重新部署
npx wrangler pages deploy zaixianhuatu-dist --project-name zaixianhuatu --branch master
```

### 自訂網域

於 Cloudflare Pages 專案的 `Custom domains` 加入網域，並將 CNAME 指向 `zaixianhuatu.pages.dev` 即可。

---

## 回滾

```bash
git checkout -- .          # 回到原始簡體版本
```

## 原始專案參考

- 影片教學：[搬瓦工 VPS 架設線上畫圖網站](https://www.youtube.com/watch?v=tXeFDaRQwDc&t=265s)（原 nginx 部署方式，本專案已改為 Cloudflare Pages）
