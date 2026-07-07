const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import CameraCapture from './CameraCapture';

export default function EnhancedPhotoUpload({ photos = [], onPhotosChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { file_url } = await db.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      onPhotosChange([...photos, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removePhoto = (index) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <>
      {showCamera && (
        <CameraCapture
          onCapture={(url) => {
            onPhotosChange([...photos, url]);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
        <label className="text-slate-400 font-medium">Photos</label>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <span className="inline-block">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-600 gap-2 pointer-events-none"
                disabled={uploading}
                type="button"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
              </Button>
            </span>
          </label>
          
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 gap-2"
            onClick={() => setShowCamera(true)}
            disabled={uploading}
          >
            <Camera className="w-4 h-4" />
            Camera
          </Button>
        </div>
      </div>

      {uploading && (
        <div className="p-3 rounded-lg bg-slate-800/50">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={photo}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <img 
                  src={photo} 
                  alt={`Photo ${index + 1}`} 
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed border-slate-700 text-slate-500">
          <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-sm">No photos added yet</p>
          <p className="text-xs mt-1">Upload or take photos to get started</p>
        </div>
      )}
      </div>
    </>
  );
}