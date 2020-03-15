import React, { useState, useEffect } from 'react';
// import logo from './logo.svg';
import {
  faPlus,
  faFileImport,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import { v4 as uuidv4 } from 'uuid';
import { flattenArr, objToArr } from './utils/helper';
import fileHelper from './utils/fileHelper';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'easymde/dist/easymde.min.css';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/TabList';
import useIpcRenderer from './hooks/useIpcRenderer';
// import defaultFiles from './utils/defaultFiles';
// import { ipcRenderer } from 'electron';
// require node.js modules
const { join, basename, extname, dirname } = window.require('path');
const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const fileStore = new Store({ name: 'Files Data' });

const saveFilesToStore = files => {
  // we don't have to store any info in file system, eg: isNew, body, etc
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createAt } = file;
    result[id] = {
      id,
      path,
      title,
      createAt
    };
    return result;
  }, {});
  fileStore.set('files', filesStoreObj);
};

function App() {
  const [files, setFiles] = useState(fileStore.get('files') || {});
  const [activeFileID, setActiveFileID] = useState('');
  const [openedFileIDs, setOpenedFileIDs] = useState([]);
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);
  const [searchedFiles, setSearchedFiles] = useState([]);
  // 计算出来的值
  const filesArr = objToArr(files);
  const savedLocation = remote.app.getPath('documents');
  const fileListArr = searchedFiles.length > 0 ? searchedFiles : filesArr;
  const activeFile = files[activeFileID];
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID];
  });

  const fileClick = fileID => {
    // set current active file
    setActiveFileID(fileID);
    const currentFile = files[fileID];
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path).then(value => {
        const newFile = { ...files[fileID], body: value, isLoaded: true };
        setFiles({ ...files, [fileID]: newFile });
      });
    }
    // if openedFiles don't have the current ID
    // then add new fileID to openedFiles
    if (!openedFileIDs.includes(fileID)) {
      // add new fileID to openedFiles
      setOpenedFileIDs([...openedFileIDs, fileID]);
    }
  };
  const tabClick = fileID => {
    // set current active file
    setActiveFileID(fileID);
  };
  const tabClose = id => {
    // remove current ID from openedFileIDs
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id);
    setOpenedFileIDs(tabsWithout);
    // set the active to the first opened tab if still have tabs left
    if (tabsWithout.length > 0) {
      setActiveFileID(tabsWithout[0]);
    } else {
      setActiveFileID('');
    }
  };
  const fileChange = (id, value) => {
    // filter out the accelerator key
    if (value !== files[id].body) {
      const newFile = { ...files[id], body: value };
      setFiles({ ...files, [id]: newFile });
      // update unsavedIDs
      if (!unsavedFileIDs.includes(id)) {
        setUnsavedFileIDs([...unsavedFileIDs, id]);
      }
    }
  };
  const deleteFile = id => {
    if (files[id].isNew) {
      // delete files[id]; // 不是 immutable
      const { [id]: value, ...afterDelete } = files; // 删除id项
      setFiles(afterDelete);
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        // delete files[id];
        const { [id]: value, ...afterDelete } = files;
        setFiles(afterDelete);
        saveFilesToStore(afterDelete);
        // close the tab if opened
        tabClose(id);
      });
    }
  };
  const updateFileName = (id, title, isNew) => {
    // newPath should be different based on isNew
    // if isNew is false, path should be old dirname + new title
    const newPath = isNew
      ? join(savedLocation, `${title}.md`)
      : join(dirname(files[id].path), `${title}.md`);
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath };
    const newFiles = { ...files, [id]: modifiedFile };
    if (isNew) {
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles);
        saveFilesToStore(newFiles); // 文件持久化
      });
    } else {
      const oldPath = files[id].path;
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles);
        saveFilesToStore(newFiles); // 文件持久化
      });
    }
  };
  const fileSearch = keyword => {
    // filter out the new files based on the keyword
    const newFiles = filesArr.filter(file => file.title.includes(keyword));
    setSearchedFiles(newFiles);
  };
  // 新建文件
  const createNewFile = () => {
    const newID = uuidv4();
    const newFile = {
      id: newID,
      title: '',
      body: '## 请输入 Markdown',
      createAt: new Date().getTime(),
      isNew: true
    };
    setFiles({ ...files, [newID]: newFile });
  };
  const saveCurrentFile = () => {
    fileHelper.writeFile(activeFile.path, activeFile.body).then(() => {
      // 更新 未保存 的数据
      setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id));
    });
  };
  const importFiles = () => {
    remote.dialog
      .showOpenDialog({
        title: '选择导入的 Markdown 文件',
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Markdown files', extensions: ['md'] }]
      })
      .then(result => {
        console.log(result.canceled);
        console.log(result.filePaths);
        if (Array.isArray(result.filePaths)) {
          // filter out the path we already have in electron store. After filtering, the result are like
          // ["C:\Users\Hello\Documents\first.md", "C:\Users\Hello\Documents\hello.md"]
          const filteredPaths = result.filePaths.filter(path => {
            const alreadyAdded = Object.values(files).find(file => {
              return file.path === path;
            });
            return !alreadyAdded;
          });
          // extend the path array to an array contains files info
          // [{id: '1', path: '...', title: '...'}, {...}]
          const importFilesArr = filteredPaths.map(path => {
            return {
              id: uuidv4(),
              title: basename(path, extname(path)),
              path
            };
          });
          // get the new files object in flattenArr
          const newFiles = { ...files, ...flattenArr(importFilesArr) };
          // setState and update electron store, then show message box
          setFiles(newFiles);
          saveFilesToStore(newFiles);
          if (importFilesArr.length > 0) {
            remote.dialog.showMessageBox({
              type: 'info',
              title: `成功导入了${importFilesArr.length}个文件`,
              message: `成功导入了${importFilesArr.length}个文件`
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
        remote.dialog.showErrorBox({
          title: '导入文件错误',
          content: err.message
        });
      });
  };

  useIpcRenderer({
    'create-new-file': createNewFile,
    'save-edit-file': saveCurrentFile,
    'search-file': () => {},
    'import-file': importFiles
  });

  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
          <FileSearch title="My document" onFileSearch={fileSearch} />
          <FileList
            files={fileListArr}
            onFileClick={fileClick}
            onFileDelete={deleteFile}
            onSaveEdit={updateFileName}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
                onBtnClick={createNewFile}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
                onBtnClick={importFiles}
              />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          {!activeFile && (
            <div className="start-page">选择或者创建新的Markdown文档。</div>
          )}
          {activeFile && (
            <>
              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsavedIds={unsavedFileIDs}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMDE
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                onChange={value => fileChange(activeFile.id, value)}
                options={{
                  minHeight: '515px'
                }}
              />
              {/* <BottomBtn
                text="保存"
                colorClass="btn-success"
                icon={faSave}
                onBtnClick={saveCurrentFile}
              ></BottomBtn> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
