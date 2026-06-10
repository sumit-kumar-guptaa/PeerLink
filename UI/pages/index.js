import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import { AlertCircle, Activity, Copy, Check } from 'lucide-react';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedPort, setCopiedPort] = useState(null);

  const handleUploadSuccess = (newFile) => {
    setFiles([newFile, ...files]);
    setSuccessMessage('File uploaded successfully! Share the port number with peers.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUploadError = (errorMsg) => {
    setError(errorMsg);
    setTimeout(() => setError(''), 5000);
  };

  const handleFileDelete = (fileName) => {
    setFiles(files.filter(f => f.name !== fileName));
    setSuccessMessage('File removed from list');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const copyToClipboard = (port) => {
    navigator.clipboard.writeText(port.toString());
    setCopiedPort(port);
    setTimeout(() => setCopiedPort(null), 2000);
  };

  return (
    <div className="min-h-screen fade-in">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3 animate-pulse">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-3">
            <Activity size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="glass-effect rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-blue-600">📤</span> Upload Files
            </h2>
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <p className="font-semibold mb-2">💡 How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Upload a file</li>
                <li>Copy the port number shown next to the file</li>
                <li>Share the port with peers to let them download</li>
              </ol>
            </div>
          </div>

          {/* Files List Section */}
          <div className="glass-effect rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-green-600">📥</span> My Uploads ({files.length})
            </h2>
            {files.length > 0 && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
                <p className="font-semibold mb-3">🔗 Share Your Files:</p>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-white p-2 rounded border border-purple-200">
                      <span className="text-xs truncate flex-1 mr-2">{file.name}</span>
                      <button
                        onClick={() => copyToClipboard(file.port)}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                      >
                        {copiedPort === file.port ? (
                          <>
                            <Check size={14} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            {file.port}
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <FileList 
              files={files}
              onDelete={handleFileDelete}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
