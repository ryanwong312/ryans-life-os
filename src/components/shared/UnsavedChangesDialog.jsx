import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function UnsavedChangesDialog({ open, onDiscard, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/20">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <DialogTitle>Unsaved Changes</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 mt-4">
            You have unsaved changes. Are you sure you want to leave? All changes will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-slate-600 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDiscard}
          >
            Discard Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}