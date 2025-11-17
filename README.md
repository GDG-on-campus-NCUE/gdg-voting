# Live Website Voting Platform

This is a simple application for running live voting sessions for websites. It uses Google Sheets as a backend to store configuration and voting data.

## Features

*   **Google Sheets Backend**: All data is stored in a Google Sheet, making it easy to manage and update.
*   **Google Sign-In**: Voters must sign in with their Google account to vote, ensuring that each person can only vote once.
*   **Group Voting Limits**: Each group is limited to a maximum of three votes.
*   **Countdown Timer**: The voting session ends automatically when the countdown timer reaches zero.
*   **Automatic Results**: The results are displayed automatically after the voting session ends, with the top three winners revealed in descending order.
*   **Responsive Design**: The interface is designed to work well on all screen sizes.

## Setup

### 1. Google Cloud Platform Project

1.  Create a new project in the [Google Cloud Platform Console](https://console.cloud.google.com/).
2.  Enable the **Google Sheets API** and the **Google Drive API**.
3.  Create an **API Key** and a **Client ID for Web application**.
4.  When creating the Client ID, add `http://localhost:3000` to the **Authorized JavaScript origins** and `http://localhost:3000` to the **Authorized redirect URIs**.

### 2. Google Sheet

1.  Create a new Google Sheet.
2.  Create two worksheets named `Config` and `Votes`.
3.  In the `Config` worksheet, set up the following columns:
    *   `A1`: The countdown duration in seconds.
    *   `A2:C`: The list of websites to be voted on.
        *   Column `A`: A unique ID for each site (e.g., `site-1`, `site-2`).
        *   Column `B`: The name of the site.
        *   Column `C`: The URL of the site.
4.  In the `Votes` worksheet, set up the following columns:
    *   `A`: The email address of the voter.
    *   `B`: The group number of the voter.
    *   `C`: The ID of the site that the voter voted for.

### 3. Application

1.  Clone the repository.
2.  Install the dependencies with `npm install`.
3.  Open `src/googleSheetsService.ts` and replace the following placeholders with your own values:
    *   `YOUR_API_KEY`
    *   `YOUR_CLIENT_ID`
    *   `YOUR_SPREADSHEET_ID`
4.  Start the development server with `npm run dev`.

## Development

The application is built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/). The code is written in [TypeScript](https://www.typescriptlang.org/).

### Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run serve`: Serves the production build.
