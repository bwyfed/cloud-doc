import React from 'react';
// import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import defaultFiles from './utils/defaultFiles';

function App() {
  return (
    <div className="App container-fluid">
      <div className="row">
        <div className="col bg-danger left-panel">
          <FileSearch
            title="My document"
            onFileSearch={value => {
              console.log(value);
            }}
          />
          <FileList files={defaultFiles} />
        </div>
        <div className="col bg-primary right-panel">
          <h1>this is the right</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
