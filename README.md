# googledrive-i18n
Make i18n json file from your google drive folder

## Requirements
1. Google Account
2. Google Sheet
3. Google Service Account (with json file)
3. node > 8

## Install
```
npm i -g googledrive-i18n
```
or
```
npm i --save-dev googledrive-i18n
```

## Usage
1. Create the service account and Enable the APIs (google-sheet, google-drive), please check this article <http://isd-soft.com/tech_blog/accessing-google-apis-using-service-account-node-js/>
1. Create a folder on your google drive and get the folder id (https://drive.google.com/drive/folders/<YOUR FOLDER ID>?ths=true)
2. Create a google-sheet file
3. Copy i18n template into your sheet and fill your own data <https://docs.google.com/spreadsheets/d/1iBbPHwa81ZzRbNX8GwcaNQz_gWz8iPE88kU1R8WsL5M/edit?usp=sharing>
4. Share your folder to your service account email (something like account-name@project-name.iam.gserviceaccount.com)
5. Use cli
  ```
  gi18n -f <google drive folder id> -k <service account json file path> -o <output path>
  ```
6. Check out your output path and find the i18n json file