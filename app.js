#!/usr/bin/env node
const program = require("commander");
const path = require("path");
const stringify = require("json-stable-stringify");

const { getFileList, getSheetData, writeFile, getAuth } = require("./lib");
let keyMap = require("./defaultKeyMap.json");

const getKey = key => keyMap[key] || key;

const assocPath = (paths, val, obj) => {
  let pointer = null;
  paths.forEach((path, index) => {
    if (pointer === null) pointer = obj;
    if (!pointer[path] && index !== paths.length - 1) pointer[path] = {};
    if (index === paths.length - 1) pointer[path] = val;
    pointer = pointer[path];
  });
};

const outputFiles = async (outputPath, data) => {
  for (const key of Object.keys(data)) {
    await writeFile(
      `${outputPath}/${key}.json`,
      stringify(data[key], { space: "\t" })
    );
  }
};

const parseKeymap = async (auth, keymapSheetId) => {
  const keyMap = {};
  const res = await getSheetData(auth, keymapSheetId);
  const [keyRow, ...rows] = res;
  rows.forEach(row =>
    row.forEach((d, i) => {
      if (i === 0) return;
      keyMap[d] = keyRow[i];
    })
  );
  return keyMap;
};

const keyMapFilter = d =>
  d.mimeType === "application/vnd.google-apps.spreadsheet" &&
  d.name.indexOf("_keymap") === 0;

const folderFilter = d =>
  d.mimeType === "application/vnd.google-apps.folder" &&
  d.name.indexOf("_") !== 0;

const sheetFilter = d =>
  d.mimeType === "application/vnd.google-apps.spreadsheet" &&
  d.name.indexOf("_") !== 0;

const scanFolder = async (auth, folderId, path = [], data) => {
  let result = data ? data : {};

  const fileList = await getFileList(auth, folderId);

  const keymapSheet = fileList.find(keyMapFilter);
  if (keymapSheet) {
    keyMap = await parseKeymap(auth, keymapSheet.id);
  }

  const folderList = fileList.filter(folderFilter);
  for (const folder of folderList) {
    result = await scanFolder(auth, folder.id, [...path, folder.name], data);
  }

  const sheetList = fileList.filter(sheetFilter);
  for (const sheet of sheetList) {
    const res = await getSheetData(auth, sheet.id);
    const sheetName = sheet.name;
    const [languages, ...strings] = res;
    strings.forEach(row => {
      const [key, ...contents] = row;
      contents.forEach((string, index) => {
        const lang = getKey(languages[index + 1]);
        if (lang.indexOf("_") == 0) return;
        assocPath([lang, ...path, sheetName, key], string, result);
      });
    });
  }

  return result;
};

const main = async (authPath, outputPath, rootFolderId) => {
  const auth = await getAuth(authPath);
  const result = await scanFolder(auth, rootFolderId);
  await outputFiles(outputPath, result);
};

program
  .version("0.0.1")
  .usage("[options]")
  .option("-f, --folder <folderId>", "google drive folderId.")
  .option(
    "-k, --key <keyFilePath>",
    'google service account json file path. Default is "./service_account.json"'
  )
  .option("-o, --out <outputPath>", "output path.")
  .parse(process.argv);

if (program.folder) {
  rootFolderId = program.folder;
  const startTime = new Date();
  main(
    program.key || "./service_account.json",
    program.out || "output",
    program.folder
  ).then(() => {
    console.log("Build Succeeded");
    console.log(`Time: ${(new Date() - startTime) / 1000}s`);
    console.log(`Path: ${path.resolve(program.out || "output")}`);
    process.exit();
  });
} else {
  program.outputHelp();
  process.exit();
}
