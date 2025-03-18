
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Plane } from 'lucide-react';

interface ObstacleAlertProps {
  open: boolean;
  onClose: () => void;
  isFlightMode?: boolean;
}

const ObstacleAlert: React.FC<ObstacleAlertProps> = ({ 
  open, 
  onClose,
  isFlightMode = false 
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
            {isFlightMode ? (
              <>
                <Plane className="h-5 w-5" /> Flight Path Obstruction Detected
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5" /> Obstacle Detected
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              {isFlightMode
                ? 'A potential obstruction has been detected in your flight path. The system is calculating a safer alternative route to avoid the obstruction.'
                : 'An obstacle has been detected in your path. The system is calculating an alternative route.'}
            </p>
            <div className="flex items-center bg-orange-50 p-3 rounded-md border border-orange-200 mt-2">
              <AlertTriangle className="text-orange-500 h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm text-orange-800">
                {isFlightMode
                  ? 'Your flight path is being automatically adjusted to ensure safety while maintaining efficiency.'
                  : 'Your route is being automatically adjusted to avoid the obstacle while maintaining efficiency.'}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            Continue with new {isFlightMode ? 'flight path' : 'route'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ObstacleAlert;
