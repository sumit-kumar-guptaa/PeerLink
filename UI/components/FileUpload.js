import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { API_ENDPOINTS } from '../pages/api/config';

export default function FileUpload({ onUploadSuccess, onUploadError }) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const uploadFile = async (file) => {
    if (!file) {
      onUploadError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await axios.post(API_ENDPOINTS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      // Backend returns port number for the file
      const port = response.data.port;
      if (!port) {
        throw new Error('No port returned from server');
      }

      const newFile = {
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        id: port,
        port: port,
      };

      onUploadSuccess(newFile);
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(
        error.response?.data?.message ||
          error.message ||
          'Failed to upload file'
      );
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleClickUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <div className="text-center">
        <div className="mb-4 flex justify-center">
          {uploading ? (
            <Loader size={48} className="text-blue-500 animate-spin" />
          ) : selectedFile ? (
            <CheckCircle size={48} className="text-green-500" />
          ) : (
            <Upload size={48} className="text-gray-400" />
          )}
        </div>

        {uploading ? (
          <div>
            <p className="text-gray-700 font-semibold mb-3">
              Uploading... {uploadProgress}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : selectedFile ? (
          <div>
            <p className="text-gray-700 font-semibold mb-2">
              {selectedFile.name}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={handleClickUpload}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold"
            >
              Upload Now
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-gray-700 font-semibold mb-2">
              Drag files here or click to select
            </p>
            <p className="text-gray-500 text-sm">
              Share any file with your peers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
