
import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PermissionStatus = ({ permissionDenied, recordingMode, requestPermissions }) => {
  if (permissionDenied) {
    return (
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto max-w-md w-auto bg-red-700/90 backdrop-blur-md text-white p-4 rounded-lg shadow-2xl border border-red-500/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Permissions Denied</h3>
            <p className="text-sm opacity-90 mb-2">
              {recordingMode === 'video' ? 'Camera and microphone' : 'Microphone'} access is required to record. 
              Please enable permissions in your browser settings.
            </p>
            <Button 
              onClick={requestPermissions} 
              size="sm" 
              className="bg-yellow-400 hover:bg-yellow-500 text-red-800 font-semibold"
            >
              Retry Permissions
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return null; 
};

export default PermissionStatus;
