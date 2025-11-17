# 即時網站投票平台

這是一個用於進行網站即時投票的簡易應用程式。它使用 Google Sheets 作為後端來儲存設定和投票資料。

## 功能

*   **Google Sheets 後端**：所有資料都儲存在 Google Sheet 中，方便管理和更新。
*   **Google 登入**：投票者必須使用其 Google 帳戶登入才能投票，確保每人只能投一次票。
*   **群組投票限制**：每個群組最多只能投三票。
*   **倒數計時器**：當倒數計時器歸零時，投票會自動結束。
*   **自動顯示結果**：投票結束後會自動顯示結果，並以倒序揭曉前三名優勝者。
*   **響應式設計**：介面設計可良好地適應各種螢幕尺寸。

## 設定

### 1. Google Cloud Platform 專案

1.  在 [Google Cloud Platform Console](https://console.cloud.google.com/) 中建立一個新專案。
2.  啟用 **Google Sheets API** 和 **Google Drive API**。
3.  建立一個 **API 金鑰** 和一個 **網頁應用程式的用戶端 ID**。
4.  建立用戶端 ID 時，將 `http://localhost:3000` 加入 **已授權的 JavaScript 來源**，並將 `http://localhost:3000` 加入 **已授權的重新導向 URI**。

### 2. Google Sheet

1.  建立一個新的 Google Sheet。
2.  建立兩個名為 `Config` 和 `Votes` 的工作表。
3.  在 `Config` 工作表中，設定以下欄位：
    *   `A1`：倒數計時的秒數。
    *   `A2:C`：要投票的網站列表。
        *   `A` 欄：每個網站的唯一 ID (例如：`site-1`, `site-2`)。
        *   `B` 欄：網站名稱。
        *   `C` 欄：網站 URL。
4.  在 `Votes` 工作表中，設定以下欄位：
    *   `A` 欄：投票者的電子郵件地址。
    *   `B` 欄：投票者的組別編號。
    *   `C` 欄：投票者所投的網站 ID。

### 3. 應用程式

1.  複製此儲存庫。
2.  使用 `npm install` 安裝相依套件。
3.  開啟 `src/googleSheetsService.ts` 並將以下預留位置替換為您自己的值：
    *   `YOUR_API_KEY`
    *   `YOUR_CLIENT_ID`
    *   `YOUR_SPREADSHEET_ID`
4.  使用 `npm run dev` 啟動開發伺服器。

## 開發

此應用程式是使用 [React](https://reactjs.org/) 和 [Vite](https://vitejs.dev/) 建構的，程式碼以 [TypeScript](https://www.typescriptlang.org/) 編寫。

### 指令

*   `npm run dev`：啟動開發伺服器。
*   `npm run build`：建構用於生產環境的應用程式。
*   `npm run serve`：提供生產版本的建構。
