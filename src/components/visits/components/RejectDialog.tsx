import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Visit } from '../../../lib/db/repositories/visits.repo';

interface RejectDialogProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
  onReject: (visitId: string, reason: string) => void;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
  visit,
  isOpen,
  onClose,
  onReject
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await onReject(visit.id, reason);
      setReason('');
    } catch (error) {
      console.error('Error rejecting visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('visits.rejectTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">{t('visits.rejectReason')}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('visits.rejectPlaceholder')}
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="destructive" 
              disabled={loading || !reason.trim()}
            >
              {loading ? t('visits.rejecting') : t('visits.rejectVisit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
