
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, VideoOff, Mic, MicOff, AlertTriangle, Loader2 } from 'lucide-react';

const RecordingPreview = ({ recordingMode, videoRef: propVideoRef, permissionGranted, permissionDenied, isRecording, stream, streamActive }) => {
  const localVideoRef = useRef(null);
  const videoRef = propVideoRef || localVideoRef;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (recordingMode === 'video' && videoElement) {
      if (stream && permissionGranted && streamActive) {
        if (videoElement.srcObject !== stream) {
          videoElement.srcObject = stream;
        }
        if (videoElement.paused) {
          videoElement.play().catch(e => console.error("Error (re)playing video preview in useEffect:", e));
        }
      } else {
        videoElement.srcObject = null;
      }
    }
  }, [recordingMode, videoRef, stream, permissionGranted, streamActive]);

  if (recordingMode === 'video') {
    const showLoading = !permissionDenied && !streamActive && permissionGranted && !isRecording;
    const showPreviewInactive = permissionGranted && !isRecording && !streamActive && !showLoading;
    const showCameraPlaceholder = !permissionGranted && !permissionDenied && !isRecording;

    return (
      <div className="mb-6">
        <div className="video-preview relative aspect-video bg-gray-900 rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-2xl"
            aria-label="Camera preview"
          />
          {showCameraPlaceholder && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl pointer-events-none">
              <div className="text-center text-white">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Camera preview</p>
              </div>
            </div>
          )}
          {permissionDenied && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/70 rounded-2xl pointer-events-none">
              <div className="text-center text-white p-4">
                <VideoOff className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Camera Access Denied</p>
                <p className="text-sm opacity-80">Check browser permissions.</p>
              </div>
            </div>
          )}
          {showLoading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl pointer-events-none">
              <Loader2 className="w-12 h-12 text-white animate-spin mb-3" />
              <p className="text-white font-semibold">Initializing camera...</p>
            </div>
          )}
          {showPreviewInactive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl pointer-events-none">
              <div className="text-center text-white p-4">
                 <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-70" />
                <p className="font-semibold">Preview Inactive</p>
                <p className="text-sm opacity-80">
                  Camera stream may have ended or is unavailable.
                </p>
                <p className="text-xs opacity-60 mt-1">Try toggling modes or re-granting permissions if issues persist.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="bg-gray-900 rounded-2xl p-8 h-64 flex items-center justify-center aspect-video relative">
        <div className="flex items-center gap-2">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 bg-blue-400 rounded-full`}
              animate={{
                height: isRecording && permissionGranted && streamActive ? [20, Math.random() * 40 + 20, 20] : 20,
              }}
              transition={{
                duration: isRecording && permissionGranted && streamActive ? 0.5 + Math.random() * 0.5 : 0.5,
                repeat: isRecording && permissionGranted && streamActive ? Infinity : 0,
                repeatType: "mirror",
                delay: i * 0.1
              }}
            />
          ))}
        </div>
         {!permissionGranted && !permissionDenied && !isRecording && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-2xl pointer-events-none">
              <div className="text-center text-white">
                <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Audio Visualizer</p>
              </div>
            </div>
          )}
          {permissionDenied && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/70 rounded-2xl pointer-events-none">
              <div className="text-center text-white p-4">
                <MicOff className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Microphone Access Denied</p>
                <p className="text-sm opacity-80">Check browser permissions.</p>
              </div>
            </div>
          )}
          {permissionGranted && !isRecording && !streamActive && recordingMode === 'audio' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl pointer-events-none">
              <div className="text-center text-white p-4">
                 <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-70" />
                <p className="font-semibold">Mic Not Detected</p>
                <p className="text-sm opacity-80">Audio stream might be inactive.</p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default RecordingPreview;
