import React, { useState } from 'react';
import { Download, Trash2, FileIcon, Clock, HardDrive } from 'lucide-react';
import { API_ENDPOINTS } from '../pages/api/config';

export default function FileList({ files, onDelete, loading }) {
  const [downloading, setDownloading] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async (file) => {
    try {
      setDownloading(file.port);
      const downloadUrl = API_ENDPOINTS.DOWNLOAD(file.port);
      const response = await fetch(downloadUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file: ' + error.message);
    } finally {
      setDownloading(null);
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 font-semibold">No files yet</p>
        <p className="text-gray-400 text-sm">Upload files to share them with peers</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <FileIcon size={20} className="text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-800 font-semibold truncate text-sm">
                  {file.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <HardDrive size={14} />
                    {formatFileSize(file.size)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDate(file.uploadedAt)}
                  </span>
                  <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Port: {file.port}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDownload(file)}
                disabled={downloading === file.port}
                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                title="Download file"
              >
                {downloading === file.port ? (
                  <div className="animate-spin">
                    <Download size={18} />
                  </div>
                ) : (
                  <Download size={18} />
                )}
              </button>
              <button
                onClick={() => onDelete(file.name)}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                title="Remove from list"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
