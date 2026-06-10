import React, { useState } from 'react';
import Header from '../components/Header';
import { Download, AlertCircle, CheckCircle, Loader, Globe } from 'lucide-react';
import { API_ENDPOINTS } from './api/config';

export default function DownloadByPort() {
  const [portInput, setPortInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDownload = async (e) => {
    e.preventDefault();
    
    if (!portInput.trim()) {
      setError('Please enter a port number');
      return;
    }

    const port = parseInt(portInput.trim());
    if (isNaN(port) || port < 49152 || port > 85535) {
      setError('Invalid port number. Must be between 49152 and 85535');
      return;
    }

    try {
      setDownloading(true);
      setError('');
      setSuccess('');
      const downloadUrl = API_ENDPOINTS.DOWNLOAD(port);

      const response = await fetch(downloadUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Port not found. Make sure the file is still being shared.');
        }
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('content-disposition');
      let downloadFileName = `downloaded-file-${port}`;
      
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match) {
          downloadFileName = match[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`File downloaded successfully!`);
      setPortInput('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen fade-in">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Globe size={32} className="text-purple-600" />
            Download from Peer
          </h1>
          <p className="text-gray-600 mb-8">Enter a port number to download a file shared by a peer</p>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-3">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Download Form */}
          <form onSubmit={handleDownload} className="mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="port" className="block text-sm font-semibold text-gray-700 mb-2">
                  Port Number
                </label>
                <input
                  id="port"
                  type="number"
                  value={portInput}
                  onChange={(e) => setPortInput(e.target.value)}
                  disabled={downloading}
                  placeholder="e.g., 54321"
                  min="49152"
                  max="85535"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Port range: 49152 - 85535
                </p>
              </div>

              <button
                type="submit"
                disabled={downloading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download File
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Section */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📖 How to Use:</h3>
            <ol className="space-y-3 text-blue-800 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-xs">1</span>
                <span>Ask your peer for their <strong>port number</strong> (they can copy it from their uploads)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-xs">2</span>
                <span>Enter the port number in the field above</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-xs">3</span>
                <span>Click <strong>Download File</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-xs">4</span>
                <span>The file will be downloaded automatically</span>
              </li>
            </ol>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-xl">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">🔐 P2P Network</h3>
            <p className="text-purple-800 text-sm mb-3">
              PeerLink is a decentralized file-sharing network. Each peer uploads files and shares port numbers with others to download directly.
            </p>
            <ul className="text-purple-800 text-sm space-y-2">
              <li>✅ No central server needed</li>
              <li>✅ Direct peer-to-peer connections</li>
              <li>✅ Share files without limits</li>
              <li>✅ Each file gets a unique port</li>
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a href="/" className="inline-block px-6 py-2 text-blue-600 hover:text-blue-800 font-semibold">
            ← Back to Uploads
          </a>
        </div>
      </main>
    </div>
  );
}
