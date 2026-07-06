import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Send, X } from "lucide-react";

interface EmailComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientEmail: string;
  recipientName: string;
  onSend: (data: { subject: string; message: string }) => void;
  isLoading?: boolean;
}

export function EmailComposerDialog({
  open,
  onOpenChange,
  recipientEmail,
  recipientName,
  onSend,
  isLoading = false,
}: EmailComposerDialogProps) {
  const [subject, setSubject] = useState(`Message from IUCB Admin - ${recipientName}`);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      alert("Please fill in both subject and message");
      return;
    }
    onSend({ subject, message });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#0F2942]">
            Compose Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={recipientEmail}
              disabled
              className="bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={10}
              className="resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <strong>Note:</strong> This email will be sent via Gmail SMTP and logged in the system.
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-[#0F2942] text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
