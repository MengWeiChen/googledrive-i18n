const { google } = require('googleapis')
const gfs = require('mkfs')
const path = require('path')

module.exports = {
  getFileList: (auth, folderId) =>
    new Promise((resolve, reject) => {
      const drive = google.drive({
        version: 'v3',
        auth
      })
      drive.files.list(
        {
          q: `'${folderId}' in parents`,
          pageSize: 100,
          fields: 'nextPageToken, files(id, name, mimeType)'
        },
        (err, res) => {
          if (err) return reject(err)
          const files = res.data.files
          resolve(files)
        }
      )
    }),
  getSheets: (auth, sheetId) => new Promise((resolve, reject) => {
    const sheets = google.sheets({ version: 'v4', auth })
    sheets.spreadsheets.get({
      spreadsheetId: sheetId
    }, (err, res)=>{
      if (err) return reject(err)
      const sheets = res.data.sheets
      resolve(sheets)
      
    })
  }),

  getSheetData: (auth, sheetId, gridName) =>
    new Promise((resolve, reject) => {
      const sheets = google.sheets({ version: 'v4', auth })
      sheets.spreadsheets.values.get(
        {
          spreadsheetId: sheetId,
          range: gridName ? `'${encodeURIComponent(gridName)}'!A1:ZZ999` : 'A1:ZZ999'
        },
        (err, res) => {
          if (err) return reject(err)
          const rows = res.data.values
          resolve(rows)
        }
      )
    }),
  writeFile: (path, data) =>
    new Promise((resolve, reject) => {
      gfs.writeFiles(path, data, 'utf8', (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    }),
  getAuth: filePath =>
    new Promise((resolve, reject) => {
      const privatekey = require(`${path.resolve(process.cwd(), filePath)}`)
      const jwtClient = new google.auth.JWT(
        privatekey.client_email,
        null,
        privatekey.private_key,
        [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive'
        ]
      )
      jwtClient.authorize((err, tokens) => {
        if (err) {
          return reject(err)
        }
        resolve(jwtClient)
      })
    })
}
