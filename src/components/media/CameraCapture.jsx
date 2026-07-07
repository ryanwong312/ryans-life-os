const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, RotateCw, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    
    setCapturing(true);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      try {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const { file_url } = await db.integrations.Core.UploadFile({ file });
        onCapture(file_url);
        stopCamera();
        onClose();
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload photo');
      } finally {
        setCapturing(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur">
        <h3 className="text-white font-semibold">Camera</h3>
        <Button variant="ghost" size="icon" onClick={() => { stopCamera(); onClose(); }}>
          <X className="w-5 h-5 text-white" />
        </Button>
      </div>

      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            className="text-white"
          >
            <RotateCw className="w-6 h-6" />
          </Button>

          <Button
            onClick={capturePhoto}
            disabled={capturing}
            className="w-16 h-16 rounded-full bg-white hover:bg-slate-200 p-0"
          >
            {capturing ? (
              <div className="w-12 h-12 rounded-full border-4 border-teal-500 animate-pulse" />
            ) : (
              <Circle className="w-12 h-12 text-slate-900" strokeWidth={3} />
            )}
          </Button>

          <div className="w-12" />
        </div>
      </div>
    </div>
  );
}