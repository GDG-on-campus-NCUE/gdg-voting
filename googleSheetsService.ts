
import { gapi } from 'gapi-script';

const API_KEY = 'YOUR_API_KEY'; // TODO: Replace with your Google API Key
const CLIENT_ID = 'YOUR_CLIENT_ID'; // TODO: Replace with your Google Client ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // TODO: Replace with your Google Spreadsheet ID

const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

export const initClient = () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        resolve(gapi);
      }).catch((error: any) => {
        reject(error);
      });
    });
  });
};

export const signIn = () => {
  return gapi.auth2.getAuthInstance().signIn();
};

export const signOut = () => {
  return gapi.auth2.getAuthInstance().signOut();
};

export const getSheetData = async (range: string) => {
  if (!gapi.client) {
    console.warn("gapi.client not initialized. Returning null.");
    return null;
  }
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });
    return response.result.values;
  } catch (error) {
    console.error("Error getting sheet data:", error);
    throw error;
  }
};


export const appendSheetData = async (range: string, values: any[][]) => {
  if (!gapi.client) {
    console.warn("gapi.client not initialized. Skipping sheet data append.");
    return;
  }
  try {
    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: values,
      },
    });
    return response;
  } catch (error) {
    console.error("Error appending sheet data:", error);
    throw error;
  }
};
