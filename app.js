#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const gfs = require("mkfs");
const { getFileList, getSheetData } = require("./lib");

let auth = '';
let rootFolderId = '';
let outputPath = 'output';


const assocPath = (paths, val, obj) => {
  let pointer = null;
  paths.forEach((path, index) => {
    if (pointer === null) pointer = obj;
    if (!pointer[path] && index !== paths.length - 1) pointer[path] = {};
    if (index === paths.length - 1) pointer[path] = val;
    pointer = pointer[path];
  });
};

const outputFiles = data => {
  const keys = Object.keys(data);
  keys.forEach(key => {
    gfs.writeFiles(
      `${outputPath}/${key}.json`,
      JSON.stringify(data[key]),
      "utf8",
      (err, data) => {
        if (err) console.log(err);
      }
    );
  });
};

const scanFolder = async (path = [], folderId = rootFolderId, data) => {
  const fileList = await getFileList(auth, folderId);
  let result = data ? data : {};

  const folderList = fileList.filter(
    d =>
      d.mimeType === "application/vnd.google-apps.folder" &&
      d.name.indexOf("_") !== 0
  );

  for (const folder of folderList) {
    result = await scanFolder([...path, folder.name], folder.id, data)
  }

  const sheetList = fileList.filter(
    d =>
      d.mimeType === "application/vnd.google-apps.spreadsheet" &&
      d.name.indexOf("_") !== 0
  );
  
  for (const sheet of sheetList) {
    const res = await getSheetData(auth, sheet.id);
    const sheetName = sheet.name;
    const [languages, ...strings] = res;
    strings.forEach(row => {
      const [key, ...contents] = row;
      contents.forEach((string, index) => {
        const lang = languages[index + 1];
        assocPath([lang, ...path, sheetName, key], string, result);
      });
    });
  }

  
  return result;
};

const main = async () => {
  const result = await scanFolder();
  outputFiles(result);
};


program
  .version('0.0.1')
  .usage('[options]')
  .option('-f, --folder <folderId>', 'google drive folderId.')
  .option('-k, --key <apiKey>', 'google api key.')
  .option('-o, --out <outputPath>', 'output path.')
  .parse(process.argv);

if(program.folder && program.key){
  if(program.out) outputPath = program.out;
  const startTime = new Date();
  auth = program.key;
  rootFolderId = program.folder;
  main().then(()=>{
    console.log('Build Succeeded');
    console.log(`Time: ${(new Date() - startTime) / 1000 }s`)
    console.log(`Path: ${path.resolve(outputPath)}`);
    process.exit();
  });
}else{
  program.outputHelp();
  process.exit();
}
