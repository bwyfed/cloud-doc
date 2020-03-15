const { remote } = require('electron');
const Store = require('electron-store');
const settingsStore = new Store({ name: 'Settings' });
const $ = id => {
  return document.getElementById(id);
};

document.addEventListener('DOMContentLoaded', () => {
  let savedLocation = settingsStore.get('savedFileLocation');
  console.log('savedLocation', savedLocation);
  if (savedLocation) {
    $('saved-file-location').value = savedLocation;
  }
  $('select-new-location').addEventListener('click', () => {
    remote.dialog
      .showOpenDialog({
        properties: ['openDirectory'],
        message: '选择文件的存储路径'
      })
      .then(result => {
        console.log(result.canceled);
        console.log(result.filePaths);
        if (Array.isArray(result.filePaths) && result.filePaths.length > 0) {
          $('saved-file-location').value = result.filePaths[0];
          savedLocation = result.filePaths[0];
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
  $('settings-form').addEventListener('submit', () => {
    settingsStore.set('savedFileLocation', savedLocation);
    remote.getCurrentWindow().close(); // 关闭当前的窗口
  });
});
