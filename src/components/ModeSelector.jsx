
import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Mic } from 'lucide-react';

const ModeSelector = ({ recordingMode, switchModeHandler, isRecording }) => {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <Button
        onClick={() => switchModeHandler('audio')}
        variant={recordingMode === 'audio' ? 'default' : 'outline'}
        className={`px-6 py-3 text-base rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
          recordingMode === 'audio'
            ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
            : 'border-green-500 text-green-400 hover:bg-green-500/10'
        }`}
        disabled={isRecording}
        aria-pressed={recordingMode === 'audio'}
      >
        <Mic className="mr-2 h-5 w-5" /> Audio Only
      </Button>
      <Button
        onClick={() => switchModeHandler('video')}
        variant={recordingMode === 'video' ? 'default' : 'outline'}
        className={`px-6 py-3 text-base rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
          recordingMode === 'video'
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
            : 'border-blue-500 text-blue-400 hover:bg-blue-500/10'
        }`}
        disabled={isRecording}
        aria-pressed={recordingMode === 'video'}
      >
        <Video className="mr-2 h-5 w-5" /> Video & Audio
      </Button>
    </div>
  );
};

export default ModeSelector;
