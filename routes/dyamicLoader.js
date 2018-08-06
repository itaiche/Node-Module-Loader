const fs = require('fs');
const request = require('request');
const loadingMap = {};
let callbackMap = {};
const DIRECTORY_PATH = process.cwd() + '/tmp/';

function log(logLine) {
  console.log(logLine);
}

function logError(errorLog) {
  console.error(errorLog);
}

createDirectory();

function getFile(url, error, callback) {
  let filePath = getFilePath(url);
  try {
    if (!loadingMap[url] && fs.existsSync(filePath)) {
      const res = require(filePath);
      log('Served ' + url + ' from File System');
      callback(res);
    } else {
      registerCallBackAndLoadFile(url, error, callback)
    }
  } catch (e) {
    logError('Error requiring file');
    logError(e);
    registerCallBackAndLoadFile(url, error, callback)
  }
}

function getFilePath(url) {
  return DIRECTORY_PATH + encodeURIComponent(url);
}

function registerCallBackAndLoadFile(url, error, callback) {
  registerCallback(url, error, callback);
  loadFileFromWeb(url);
}

function registerCallback(url, error, callback) {
  callbackMap[url] = callbackMap[url] || [];
  callbackMap[url].push({error, callback});
}

function loadFileFromWeb(url) {
  loadingMap[url] = true;
  request.get(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      log('Loaded ' + url + ' from Web');
      saveToFileSystem(url, body);
    } else if (error) {
      logError('Failed to load ' + url + 'from Web');
      executeListeners(url, false, body);
    }
  });
}

function createDirectory() {
  try {
    if (!fs.existsSync(DIRECTORY_PATH)) {
      fs.mkdirSync(DIRECTORY_PATH);
    }
  } catch (e) {
    logError('Failed to create directory ' + DIRECTORY_PATH);
  }
}

function saveToFileSystem(url, body) {
  fs.writeFile(getFilePath(url), body, function (err) {
    if (err) {
      logError('Failed to write ' + url + ' to FileSystem from Web');
      executeListeners(url, true, err);
    } else {
      log('Wrote ' + url + ' to FileSystem from Web');
      const res = require(getFilePath(url));
      executeListeners(url, false, res);
    }
  });
}

function executeListeners(url, error, module) {
  if (callbackMap[url]) {
    callbackMap[url].forEach((handler) => {
      try {
        if (error && typeof handler.error === 'function') {
          handler.error(error);
        } else if (typeof handler.callback === 'function') {
          handler.callback(module);
        }
      } catch (e) {
        logError('Exception executing callback for ' + url);
      }
    });
    cleanUpLoaded(url);
  }
}

function cleanUpLoaded(url) {
  callbackMap[url].length = 0;
  delete callbackMap[url];
  delete loadingMap[url];
}

module.exports = getFile;