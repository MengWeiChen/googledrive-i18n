const { google } = require("googleapis");
const gfs = require("mkfs");

module.exports = {
  getFileList: (auth, folderId) =>
    new Promise((resolve, reject) => {
      const drive = google.drive({
        version: "v3",
        auth
      });
      drive.files.list(
        {
          q: `'${folderId}' in parents`,
          pageSize: 100,
          fields: "nextPageToken, files(id, name, mimeType)"
        },
        (err, res) => {
          if (err) return reject(err);
          const files = res.data.files;
          resolve(files);
        }
      );
    }),
  getSheetData: (auth, sheetId) =>
    new Promise((resolve, reject) => {
      const sheets = google.sheets({ version: "v4", auth });
      sheets.spreadsheets.values.get(
        {
          spreadsheetId: sheetId,
          range: "A1:ZZ999"
        },
        (err, res) => {
          if (err) return reject(err);
          const rows = res.data.values;
          resolve(rows);
        }
      );
    }),
  writeFile: (path, data) =>
    new Promise((resolve, reject) => {
      gfs.writeFiles(
        path, data, "utf8",
        (err, data) => {
          if (err) return reject(err);
          resolve(data);
        }
      );
    }),
  getAuth: (path) => 
    new Promise((resolve, reject) => {
      const privatekey = require(`${path}`);
      const jwtClient = new google.auth.JWT(
        privatekey.client_email,
        null,
        privatekey.private_key,
        ['https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive']);
      jwtClient.authorize((err, tokens) => {
        if (err) { return reject(err); }
        resolve(jwtClient);
      });
    })
};
