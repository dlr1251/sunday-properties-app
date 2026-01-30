import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Copy } from 'lucide-react';

export interface PromptPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  templateName?: string;
}

export function PromptPreviewDialog({
  open,
  onOpenChange,
  prompt,
  templateName,
}: PromptPreviewDialogProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] flex flex-col"
        showClose={true}
        onClose={() => onOpenChange(false)}
      >
        <DialogHeader>
          <DialogTitle>
            {templateName ? `Prompt: ${templateName}` : 'Vista previa del prompt'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <pre className="flex-1 overflow-auto rounded-lg border border-input bg-muted/30 p-4 text-sm whitespace-pre-wrap font-mono">
            {prompt || '(vacío)'}
          </pre>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button type="button" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
