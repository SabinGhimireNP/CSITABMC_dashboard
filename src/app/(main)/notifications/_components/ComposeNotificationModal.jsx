"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Send, Users, UserCheck, AlertCircle } from "lucide-react";
import { ModalShell } from "@/components/common/ModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEligibleRecipients, useSendNotification } from "@/hooks/useNotifications";
import { parseServerError } from "@/lib/errorUtils";

export function ComposeNotificationModal({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [allEligible, setAllEligible] = useState(false);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [searchRecipient, setSearchRecipient] = useState("");
  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const { data: eligibleUsers = [], isLoading: isLoadingRecipients } = useEligibleRecipients();
  const sendMutation = useSendNotification();

  if (!isOpen) return null;

  const handleClose = () => {
    if (sendMutation.isPending) return;
    setTitle("");
    setMessage("");
    setAllEligible(false);
    setSelectedRecipientIds([]);
    setSearchRecipient("");
    setClientErrors({});
    setServerError("");
    onClose();
  };

  const handleToggleRecipient = (id) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (clientErrors.recipients) {
      setClientErrors((prev) => ({ ...prev, recipients: null }));
    }
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredUsers.map((u) => u.id);
    setSelectedRecipientIds((prev) => Array.from(new Set([...prev, ...ids])));
    if (clientErrors.recipients) {
      setClientErrors((prev) => ({ ...prev, recipients: null }));
    }
  };

  const handleDeselectAll = () => {
    setSelectedRecipientIds([]);
  };

  const filteredUsers = eligibleUsers.filter((u) => {
    const query = searchRecipient.toLowerCase().trim();
    if (!query) return true;
    return (
      u.name?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.role_label?.toLowerCase().includes(query)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientErrors({});
    setServerError("");

    const errors = {};
    if (!title.trim()) errors.title = "Notification title is required.";
    if (!message.trim()) errors.message = "Notification message is required.";
    if (!allEligible && selectedRecipientIds.length === 0) {
      errors.recipients = "Select at least one recipient user or choose All Eligible Users.";
    }

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    try {
      await sendMutation.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        all_eligible: allEligible,
        recipient_ids: allEligible ? [] : selectedRecipientIds,
      });

      toast.success("Notification sent successfully!");
      handleClose();
    } catch (err) {
      const msg = parseServerError(err, "Failed to send notification.");
      setServerError(msg);
    }
  };

  return (
    <ModalShell
      title="Compose Notification"
      subtitle="Send an in-app notification to dashboard administrators and staff"
      icon={Send}
      onClose={handleClose}
      closeDisabled={sendMutation.isPending}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={sendMutation.isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="compose-notification-form"
            disabled={sendMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer"
          >
            {sendMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send className="w-4 h-4" /> Send Notification
              </span>
            )}
          </Button>
        </div>
      }
    >
      <form id="compose-notification-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="leading-snug">{serverError}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="notif-title" className="text-xs font-semibold text-foreground">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="notif-title"
            placeholder="e.g. Scheduled Maintenance, Meeting Reminder"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (clientErrors.title) setClientErrors((prev) => ({ ...prev, title: null }));
            }}
            disabled={sendMutation.isPending}
            className={`h-9 text-xs ${clientErrors.title ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {clientErrors.title && (
            <p className="text-destructive text-[11px]">{clientErrors.title}</p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <Label htmlFor="notif-message" className="text-xs font-semibold text-foreground">
            Message <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="notif-message"
            rows={4}
            placeholder="Type your notification message here..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (clientErrors.message) setClientErrors((prev) => ({ ...prev, message: null }));
            }}
            disabled={sendMutation.isPending}
            className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
              clientErrors.message ? "border-destructive focus-visible:ring-destructive" : ""
            }`}
          />
          {clientErrors.message && (
            <p className="text-destructive text-[11px]">{clientErrors.message}</p>
          )}
        </div>

        {/* Recipients Mode */}
        <div className="space-y-2 pt-2 border-t border-border">
          <Label className="text-xs font-semibold text-foreground block">
            Recipients <span className="text-destructive">*</span>
          </Label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setAllEligible(false);
                if (clientErrors.recipients) setClientErrors((prev) => ({ ...prev, recipients: null }));
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                !allEligible
                  ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                  : "border-border bg-card hover:bg-muted/30 text-muted-foreground"
              }`}
            >
              <Users className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold">Specific Users</p>
                <p className="text-[10px] text-muted-foreground">Select individuals</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setAllEligible(true);
                if (clientErrors.recipients) setClientErrors((prev) => ({ ...prev, recipients: null }));
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                allEligible
                  ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                  : "border-border bg-card hover:bg-muted/30 text-muted-foreground"
              }`}
            >
              <UserCheck className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold">All Eligible Users</p>
                <p className="text-[10px] text-muted-foreground">Admins & CMS Users</p>
              </div>
            </button>
          </div>

          {clientErrors.recipients && (
            <p className="text-destructive text-[11px] mt-1">{clientErrors.recipients}</p>
          )}

          {/* Specific Users Picker */}
          {!allEligible && (
            <div className="mt-3 p-3 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Input
                  placeholder="Search users by name, username, or role..."
                  value={searchRecipient}
                  onChange={(e) => setSearchRecipient(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllFiltered}
                    className="text-[11px] h-7 px-2 cursor-pointer"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="text-[11px] h-7 px-2 cursor-pointer text-muted-foreground"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Users Checkbox List */}
              <div className="max-h-40 overflow-y-auto divide-y divide-border/60 rounded-lg border border-border bg-background scrollbar-thin">
                {isLoadingRecipients ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">Loading eligible users...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">No eligible users found</p>
                ) : (
                  filteredUsers.map((u) => {
                    const isChecked = selectedRecipientIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className={`px-3 py-2 flex items-center justify-between hover:bg-muted/40 cursor-pointer text-xs ${
                          isChecked ? "bg-primary/[0.04]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleRecipient(u.id)}
                            className="rounded border-input text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                          />
                          <div>
                            <span className="font-medium text-foreground">{u.name}</span>
                            <span className="text-[11px] text-muted-foreground ml-1.5">(@{u.username})</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
                          {u.role_label || u.role}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="text-[11px] text-muted-foreground text-right">
                {selectedRecipientIds.length} user(s) selected
              </div>
            </div>
          )}
        </div>
      </form>
    </ModalShell>
  );
}

