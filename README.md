# googledrive-i18n
Make i18n json file from your google drive folder

##Requirements
1. Google Account
2. Google Sheet
3. Google API key (whth google-drive and google-sheet access permission)
3. node > 8.7.0

## Install
```
npm i -g googledrive-i18n
```

## Usage
1. Create a folder on your google drive
2. Create a google-sheet file
3. Copy i18n template into your sheet and fill your own data
4. Change sharing permissions of shared folder to "Anyone with a link to the folder"
5. Use cli
```
gi18n -f <google drive folder id> -k <google google api key> -o <output path>
```
6. Check out your output path and find the i18n json file