
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import { Clock } from 'lucide-react';
import { useRecorder } from '@/hooks/useRecorder';
import { formatTime } from '@/lib/utils';
import RecorderControls from '@/components/RecorderControls';
import RecordingPreview from '@/components/RecordingPreview';
import RecordingList from '@/components/RecordingList';
import ModeSelector from '@/components/ModeSelector';
import PermissionStatus from '@/components/PermissionStatus';

const App = () => {
  const {
    recordingMode,
    isRecording,
    isPaused,
    recordingTime,
    currentRecording,
    permissionGranted,
    permissionDenied,
    streamActive,
    videoRef,
    stream, 
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    switchMode,
    setCurrentRecording,
    cleanupStream,
    requestPermissions 
  } = useRecorder('audio');

  const [recordings, setRecordings] = useState([]);

  const initialPermissionRequest = useCallback(async () => {
    await requestPermissions('audio');
  }, [requestPermissions]);

  useEffect(() => {
    const savedRecordings = localStorage.getItem('audioVideoRecordings');
    if (savedRecordings) {
      try {
        const parsedRecordings = JSON.parse(savedRecordings);
        setRecordings(parsedRecordings);
      } catch (e) {
        console.error("Failed to parse recordings from localStorage", e);
        localStorage.removeItem('audioVideoRecordings'); 
      }
    }
    initialPermissionRequest();
  }, [initialPermissionRequest]); 

  useEffect(() => {
    localStorage.setItem('audioVideoRecordings', JSON.stringify(recordings)); 
  }, [recordings]);

  useEffect(() => {
    return () => {
      cleanupStream();
      recordings.forEach(rec => {
        if (rec.url && rec.url.startsWith('blob:')) {
          URL.revokeObjectURL(rec.url);
        }
      });
      if(currentRecording && currentRecording.url && currentRecording.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentRecording.url);
      }
    };
  }, [cleanupStream, recordings, currentRecording]);


  const saveRecordingHandler = () => {
    if (currentRecording) {
      const newRecording = {
        id: Date.now(),
        type: currentRecording.type,
        url: currentRecording.url, 
        duration: currentRecording.duration,
        timestamp: new Date().toISOString(),
        name: currentRecording.name || `${currentRecording.type}_${new Date().toLocaleDateString().replace(/\//g, '-')}_${new Date().toLocaleTimeString().replace(/:/g, '-')}`
      };

      setRecordings(prev => [newRecording, ...prev.filter(r => r.id !== newRecording.id)]); // Avoid duplicates if somehow saved twice
      setCurrentRecording(null); 

      toast({
        title: "💾 Recording Saved",
        description: "Your recording has been saved to the library.",
      });
    }
  };

  const downloadRecordingHandler = (recordingToDownload) => {
    if (!recordingToDownload || !recordingToDownload.url || !recordingToDownload.name) {
        toast({
            title: "❌ Download Error",
            description: "Recording data is incomplete. Cannot download.",
            variant: "destructive",
        });
        return;
    }
    
    if (!recordingToDownload.url.startsWith('blob:')) {
      toast({
        title: "⚠️ Download Unavailable",
        description: "This recording was loaded from a previous session and its direct download link may have expired. Please re-record if needed.",
        variant: "destructive"
      });
      return;
    }

    const link = document.createElement('a');
    link.href = recordingToDownload.url;
    const extension = recordingToDownload.type === 'video' ? 'webm' : 'webm'; 
    link.download = `${recordingToDownload.name}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "⬇️ Download Started",
      description: `Downloading ${recordingToDownload.name}.${extension}`,
    });
  };

  const deleteRecordingHandler = (id) => {
    const recordingToDelete = recordings.find(rec => rec.id === id);
    if (recordingToDelete && recordingToDelete.url && recordingToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(recordingToDelete.url); 
    }
    setRecordings(prev => prev.filter(rec => rec.id !== id));
    toast({
      title: "🗑️ Recording Deleted",
      description: "Recording has been removed from your library.",
    });
  };

  return (
    <div className="min-h-screen gradient-bg text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            Audio & Video Recorder
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Capture, preview, and manage your recordings with ease.
          </p>
        </motion.header>

        <ModeSelector recordingMode={recordingMode} switchModeHandler={switchMode} isRecording={isRecording} />

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect rounded-3xl p-6 sm:p-8"
            aria-labelledby="recording-section-title"
          >
            <div className="text-center mb-6">
              <h2 id="recording-section-title" className="text-xl sm:text-2xl font-bold mb-2">
                {recordingMode === 'video' ? 'Video Recording' : 'Audio Recording'}
              </h2>
              <p className="text-white/70 text-sm sm:text-base">
                {isRecording ? `Currently recording ${recordingMode}...` : (permissionGranted && streamActive ? `Ready to record ${recordingMode}`: `Requesting ${recordingMode} permissions...`)}
              </p>
            </div>

            <RecordingPreview 
              recordingMode={recordingMode}
              videoRef={videoRef}
              permissionGranted={permissionGranted}
              permissionDenied={permissionDenied}
              isRecording={isRecording}
              stream={stream}
              streamActive={streamActive}
            />

            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                isRecording && permissionGranted && streamActive ? 'bg-red-500/20 text-red-400 recording-indicator' : 'bg-gray-700 text-gray-300'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="timer-display text-lg sm:text-xl font-mono" aria-live="polite">
                  {formatTime(recordingTime)}
                </span>
                {isRecording && !isPaused && permissionGranted && streamActive && (
                  <div className="w-2 h-2 bg-red-500 rounded-full recording-pulse" />
                )}
                 {isRecording && isPaused && permissionGranted && streamActive && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                )}
              </div>
            </div>

            <RecorderControls
              isRecording={isRecording}
              isPaused={isPaused}
              recordingMode={recordingMode}
              currentRecording={currentRecording}
              startRecording={startRecording}
              pauseRecording={pauseRecording}
              resumeRecording={resumeRecording}
              stopRecording={stopRecording}
              saveRecordingHandler={saveRecordingHandler}
              downloadRecordingHandler={downloadRecordingHandler}
              permissionGranted={permissionGranted}
              streamActive={streamActive}
            />
          </motion.section>

          <RecordingList 
            recordings={recordings}
            downloadRecordingHandler={downloadRecordingHandler}
            deleteRecordingHandler={deleteRecordingHandler}
            recordingMode={recordingMode}
          />
        </div>
        
        <PermissionStatus permissionDenied={permissionDenied} recordingMode={recordingMode} requestPermissions={() => requestPermissions(recordingMode)} />
      </div>
      <Toaster />
    </div>
  );
};

export default App;
