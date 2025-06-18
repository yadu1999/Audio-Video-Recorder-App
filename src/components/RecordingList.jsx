
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileAudio, FileVideo } from 'lucide-react';
import { formatTime } from '@/lib/utils';

const RecordingList = ({ recordings, downloadRecordingHandler, deleteRecordingHandler, recordingMode }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-effect rounded-3xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Your Recordings</h2>
        <div className="text-white/70 text-sm sm:text-base">
          {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {recordings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white/50 mb-4">
              {recordingMode === 'video' ? <FileVideo className="w-16 h-16 mx-auto" /> : <FileAudio className="w-16 h-16 mx-auto" />}
            </div>
            <p className="text-white/70">No recordings yet</p>
            <p className="text-white/50 text-sm">Start recording to build your library</p>
          </div>
        ) : (
          recordings.map((recording) => (
            <motion.div
              key={recording.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              layout
              className="recording-list-item p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  {recording.type === 'video' ? (
                    <FileVideo className="w-8 h-8 text-blue-400" />
                  ) : (
                    <FileAudio className="w-8 h-8 text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate text-sm sm:text-base" title={recording.name}>
                    {recording.name}
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm">
                    {formatTime(recording.duration)} • {new Date(recording.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                  <Button
                    onClick={() => downloadRecordingHandler(recording)}
                    size="sm"
                    variant="outline"
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                    aria-label={`Download recording ${recording.name}`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteRecordingHandler(recording.id)}
                    size="sm"
                    variant="outline"
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                    aria-label={`Delete recording ${recording.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3">
                {recording.type === 'video' ? (
                  <video
                    src={recording.url}
                    controls
                    className="w-full h-32 rounded-lg object-cover bg-gray-900"
                    aria-label={`Preview of video recording ${recording.name}`}
                  />
                ) : (
                  <audio
                    src={recording.url}
                    controls
                    className="w-full"
                    aria-label={`Playback of audio recording ${recording.name}`}
                  />
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default RecordingList;
