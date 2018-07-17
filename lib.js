const { google } = require("googleapis");

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
    })
};
