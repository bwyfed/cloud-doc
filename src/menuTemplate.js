const { app, shell } = require('electron');

let template = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建',
        accelarator: 'CmdOrCtrl+N',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('create-new-file');
        }
      },
      {
        label: '保存',
        accelarator: 'CmdOrCtrl+S',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('save-edit-file');
        }
      },
      {
        label: '搜索',
        accelarator: 'CmdOrCtrl+F',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('search-file');
        }
      },
      {
        label: '导入',
        accelarator: 'CmdOrCtrl+O',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('import-file');
        }
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      { label: '撤销', accelarator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: '重做', accelarator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
      { type: 'separator' },
      { label: '剪切', accelarator: 'CmdOrCtrl+X', role: 'cut' },
      { label: '复制', accelarator: 'CmdOrCtrl+C', role: 'copy' },
      { label: '粘贴', accelarator: 'CmdOrCtrl+V', role: 'paste' },
      { label: '全选', accelarator: 'CmdOrCtrl+A', role: 'selectall' }
    ]
  },
  {
    label: '视图',
    submenu: [
      {
        label: '刷新当前页面',
        accelarator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: '切换全屏幕',
        accelarator: (() => {
          if (process.platform === 'darwin') return 'Ctrl+Command+F';
          else return 'F11';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: '切换开发者工具',
        accelarator: (function() {
          if (process.platform === 'darwin') return 'Alt+Command+I';
          else return 'Ctrl+Shift+I';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) focusedWindow.toggleDevTools();
        }
      }
    ]
  },
  {
    label: '窗口',
    role: 'window',
    submenu: [
      { label: '最小化', accelarator: 'CmdOrCtrl+M', role: 'minimize' },
      { label: '关闭', accelarator: 'CmdOrCtrl+W', role: 'close' }
    ]
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: '学习更多',
        click: () => {
          shell.openExternal('http://electron.atom.io');
        }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      { label: `关于 ${name}`, role: 'about' },
      { type: 'separator' },
      { label: '设置', accelarator: 'Command+,', click: () => {} },
      { label: '服务', role: 'services', submenu: [] },
      { type: 'separator' },
      { label: `隐藏 ${name}`, accelarator: 'Command+H', role: 'hide' },
      { label: '隐藏其它', accelarator: 'Command+Alt+H', role: 'hideothers' },
      { label: '显示全部', role: 'unhide' },
      { type: 'separator' },
      {
        label: '退出',
        accelarator: 'Command+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  });
}
module.exports = template;
