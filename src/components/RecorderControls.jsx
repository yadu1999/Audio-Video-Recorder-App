
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle, Download, Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const RecorderControls = ({
  isRecording,
  isPaused,
  recordingMode,
  currentRecording,
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  saveRecordingHandler,
  downloadRecordingHandler,
  permissionGranted,
  streamActive
}) => {
  const canRecord = permissionGranted && streamActive;

  return (
    <div className="flex flex-col items-center gap-4">
      {!currentRecording ? (
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-full w-20 h-20 shadow-xl transform transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Start recording"
              disabled={!canRecord}
            >
              <Play className="w-8 h-8" />
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button
                  onClick={resumeRecording}
                  size="lg"
                  variant="outline"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 rounded-full w-20 h-20 shadow-lg transform transition-all duration-200 hover:scale-110"
                  aria-label="Resume recording"
                >
                  <Play className="w-8 h-8" />
                </Button>
              ) : (
                <Button
                  onClick={pauseRecording}
                  size="lg"
                  variant="outline"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 rounded-full w-20 h-20 shadow-lg transform transition-all duration-200 hover:scale-110"
                  aria-label="Pause recording"
                >
                  <Pause className="w-8 h-8" />
                </Button>
              )}
              <Button
                onClick={stopRecording}
                size="lg"
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full w-20 h-20 shadow-xl transform transition-all duration-200 hover:scale-110"
                aria-label="Stop recording"
              >
                <StopCircle className="w-8 h-8" />
              </Button>
            </>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-4 bg-white/10 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-center mb-4">Recording Ready!</h3>
          {currentRecording.type === 'video' ? (
            <video src={currentRecording.url} controls className="w-full rounded-lg mb-4 h-48 object-cover bg-black" />
          ) : (
            <audio src={currentRecording.url} controls className="w-full mb-4" />
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => downloadRecordingHandler(currentRecording)} variant="outline" className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/10">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button onClick={saveRecordingHandler} variant="outline" className="flex-1 border-green-500 text-green-400 hover:bg-green-500/10">
              <Save className="mr-2 h-4 w-4" /> Save to Library
            </Button>
          </div>
           <Button 
            onClick={() => {
              URL.revokeObjectURL(currentRecording.url);
              startRecording(); 
            }} 
            variant="ghost" 
            className="w-full mt-3 text-white/70 hover:text-white hover:bg-white/5"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Record Again
          </Button>
        </motion.div>
      )}
      {!canRecord && !isRecording && !currentRecording && (
        <p className="text-sm text-yellow-400/80 mt-2 text-center">
          {permissionGranted ? "Stream is not active. Check camera/mic." : "Permissions needed to start recording."}
        </p>
      )}
    </div>
  );
};

export default RecorderControls;
