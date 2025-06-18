
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useRecorder = (initialMode = 'audio') => {
  const [recordingMode, setRecordingMode] = useState(initialMode);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [stream, setStream] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [streamActive, setStreamActive] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null); 

  useEffect(() => {
    mediaRecorderRef.current = mediaRecorder;
  }, [mediaRecorder]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  const checkStreamTracksStatus = useCallback(() => {
    if (stream) {
      let active = false;
      if (recordingMode === 'video') {
        const videoTracks = stream.getVideoTracks();
        active = videoTracks.some(track => track.readyState === 'live' && !track.muted);
      } else {
        const audioTracks = stream.getAudioTracks();
        active = audioTracks.some(track => track.readyState === 'live' && !track.muted);
      }
      setStreamActive(active);
      if (!active && videoRef.current && recordingMode === 'video') {
        videoRef.current.srcObject = null; 
      }
    } else {
      setStreamActive(false);
    }
  }, [stream, recordingMode]);

  useEffect(() => {
    checkStreamTracksStatus();
    if (stream) {
      stream.getTracks().forEach(track => {
        track.onended = checkStreamTracksStatus;
        track.onmute = checkStreamTracksStatus;
        track.onunmute = checkStreamTracksStatus;
      });
      return () => {
        stream.getTracks().forEach(track => {
          track.onended = null;
          track.onmute = null;
          track.onunmute = null;
        });
      };
    }
  }, [stream, checkStreamTracksStatus]);

  const cleanupStreamTracks = useCallback((mediaStreamToClean, keepVideoPreview = false) => {
    if (mediaStreamToClean) {
      mediaStreamToClean.getTracks().forEach(track => {
        if (keepVideoPreview && track.kind === 'video' && recordingMode === 'video' && videoRef.current) {
          return; 
        }
        track.stop();
      });
    }
  }, [recordingMode]);

  const requestPermissions = useCallback(async (mode) => {
    if (stream) {
      cleanupStreamTracks(stream, false);
      setStream(null);
    }
    if (videoRef.current) {
       videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setPermissionGranted(false);
    setPermissionDenied(false);

    try {
      const constraints = mode === 'video' 
        ? { audio: true, video: { facingMode: "user", width: { ideal: 1280 }, height: {ideal: 720} } } 
        : { audio: true };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setPermissionGranted(true);
      setPermissionDenied(false);
      
      if (mode === 'video' && videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setStreamActive(true); 
          }).catch(e => {
            console.error("Error playing video preview:", e);
            setStreamActive(false);
          });
        };
        videoRef.current.onerror = () => {
            console.error("Video element error during permission request.");
            setStreamActive(false);
        };
      } else if (mode === 'audio') {
        setStreamActive(newStream.getAudioTracks().some(t => t.readyState === 'live'));
      }


      toast({
        title: "🎉 Permissions Granted!",
        description: `${mode === 'video' ? 'Camera and microphone' : 'Microphone'} access enabled.`,
      });
      return newStream;
    } catch (error) {
      console.error("Permission error:", error);
      setPermissionDenied(true);
      setPermissionGranted(false);
      setStreamActive(false);
      toast({
        title: "❌ Permission Denied",
        description: `Please allow ${mode === 'video' ? 'camera and microphone' : 'microphone'} access.`,
        variant: "destructive"
      });
      return null;
    }
  }, [cleanupStreamTracks]);

  const startRecording = async () => {
    let activeStream = stream;
    
    if (!permissionGranted || !activeStream || !streamActive) {
        activeStream = await requestPermissions(recordingMode);
        if (!activeStream) return;
    }
    
    try {
      const options = {
        mimeType: recordingMode === 'video' 
          ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm')
          : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'),
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: recordingMode === 'video' ? 2500000 : undefined,
      };
      
      const recorder = new MediaRecorder(activeStream, options);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: options.mimeType
        });
        const url = URL.createObjectURL(blob);
        const name = `${recordingMode}_${new Date().toLocaleDateString().replace(/\//g, '-')}_${new Date().toLocaleTimeString().replace(/:/g, '-')}`;
        setCurrentRecording({ blob, url, type: recordingMode, name, duration: recordingTime });
        
        if (recordingMode === 'audio' && stream) {
            cleanupStreamTracks(stream, false);
            setStream(null); 
        } else if (recordingMode === 'video' && stream) {
            // Keep video track for preview, audio track might have been part of recording
            // This part is tricky: if audio was recorded, stopping its track might affect preview
            // For simplicity, we let cleanupStream handle it on mode switch/unmount
            checkStreamTracksStatus(); // Re-check status after recording stops
        }
      };
      
      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        toast({
          title: "❌ Recording Error",
          description: `An error occurred with the recorder: ${event.error.name}`,
          variant: "destructive"
        });
        setIsRecording(false);
        setIsPaused(false);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setCurrentRecording(null);

      toast({
        title: "🔴 Recording Started",
        description: `${recordingMode === 'video' ? 'Video' : 'Audio'} recording is now active.`,
      });

    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({
        title: "❌ Recording Failed",
        description: "Unable to start recording. Please check your device and browser permissions. Details in console.",
        variant: "destructive"
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      toast({
        title: "⏸️ Recording Paused",
        description: "Recording has been paused.",
      });
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      toast({
        title: "▶️ Recording Resumed",
        description: "Recording has been resumed.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
      mediaRecorderRef.current.stop(); 
      setIsRecording(false);
      setIsPaused(false);
      
      toast({
        title: "⏹️ Recording Stopped",
        description: "Your recording is ready for preview and download.",
      });
    }
  };

  const switchMode = useCallback(async (mode) => {
    if (isRecording) {
      toast({
        title: "⚠️ Cannot Switch Mode",
        description: "Please stop the current recording before switching modes.",
        variant: "destructive"
      });
      return;
    }

    setRecordingMode(mode);
    setCurrentRecording(null); 
    
    if (stream) {
      cleanupStreamTracks(stream, false);
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    
    await requestPermissions(mode);

    toast({
      title: `🔄 Switched to ${mode === 'video' ? 'Video' : 'Audio'} Mode`,
      description: `Ready to record ${mode === 'video' ? 'video + audio' : 'audio only'}.`,
    });
  }, [isRecording, stream, cleanupStreamTracks, requestPermissions]);
  
  const cleanupResources = useCallback(() => {
    if (stream) {
      cleanupStreamTracks(stream, false);
      setStream(null);
    }
    if (videoRef.current) {
       videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    clearInterval(timerRef.current);
  }, [stream, cleanupStreamTracks]);

  return {
    recordingMode,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder,
    currentRecording,
    stream,
    permissionGranted,
    permissionDenied,
    streamActive,
    videoRef,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    switchMode,
    setCurrentRecording,
    setRecordingTime,
    requestPermissions,
    cleanupStream: cleanupResources 
  };
};
