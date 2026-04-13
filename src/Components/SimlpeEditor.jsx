// components/SimpleEditor.jsx
import { useState } from 'react';
import Editor from '@monaco-editor/react';

const SimpleEditor = () => {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello World!");');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const resetCode = () => {
    setCode('// Write your code here\nconsole.log("Hello World!");');
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'markdown', label: 'Markdown' }
  ];

  const themes = [
    { value: 'vs', label: 'Light' },
    { value: 'vs-dark', label: 'Dark' },
    { value: 'hc-black', label: 'High Contrast' }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Simple Toolbar */}
      <div className="bg-gray-800 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">Theme:</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
            >
              {themes.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={resetCode}
          className="px-4 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
        >
          Reset
        </button>
      </div>

      {/* Editor - Takes full remaining space */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme={theme}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: 'on',
            roundedSelection: false,
            folding: true,
            lineDecorationsWidth: 10,
            glyphMargin: true,
          }}
        />
      </div>

      {/* Simple Status Bar */}
      <div className="bg-gray-800 text-gray-400 text-xs p-2 flex justify-between">
        <span>Lines: {code.split('\n').length}</span>
        <span>Characters: {code.length}</span>
        <span>Language: {language}</span>
      </div>
    </div>
  );
};

export default SimpleEditor;