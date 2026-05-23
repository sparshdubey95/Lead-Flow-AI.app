"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Lead, Message } from "./page";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Zap,
  MessageSquareText,
  Inbox as InboxIcon,
  ArrowLeft,
  Search,
} from "lucide-react";

// ──────────────────────────────────────────────
// Helper: format timestamp for display
// ──────────────────────────────────────────────
function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ──────────────────────────────────────────────
// Main Client Component
// ──────────────────────────────────────────────
interface InboxClientProps {
  initialLeads: Lead[];
  organizationId: string;
  userId: string;
}

export function InboxClient({
  initialLeads,
  organizationId,
  userId,
}: InboxClientProps) {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    initialLeads[0]?.id ?? null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [manualMessage, setManualMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? null;

  // ──────────────────────────────────────────
  // Auto-scroll to bottom when messages change
  // ──────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedLead?.messages]);

  // ──────────────────────────────────────────
  // Supabase Realtime: Listen for new messages
  // ──────────────────────────────────────────
  const handleRealtimeMessage = useCallback(
    (payload: { new: Message }) => {
      const newMsg = payload.new as Message;

      setLeads((prev) => {
        const updated = prev.map((lead) => {
          if (lead.id === newMsg.lead_id) {
            // Avoid duplicates
            const exists = lead.messages.some((m) => m.id === newMsg.id);
            if (exists) return lead;
            return {
              ...lead,
              messages: [...lead.messages, newMsg],
              updated_at: newMsg.created_at,
            };
          }
          return lead;
        });

        // Sort leads so the most recently active is on top
        return updated.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at).getTime() -
            new Date(a.updated_at || a.created_at).getTime()
        );
      });
    },
    []
  );

  // Listen for new leads (when the webhook server inserts a new one)
  const handleRealtimeLead = useCallback(
    (payload: { new: Lead }) => {
      const newLead = payload.new as Lead;
      if (newLead.organization_id !== organizationId) return;

      setLeads((prev) => {
        const exists = prev.some((l) => l.id === newLead.id);
        if (exists) return prev;
        return [{ ...newLead, messages: [], tags: newLead.tags || [] }, ...prev];
      });
    },
    [organizationId]
  );

  useEffect(() => {
    // Get all lead IDs for this org to filter messages
    const leadIds = leads.map((l) => l.id);

    // Subscribe to new messages for leads in this org
    const messagesChannel = supabase
      .channel("inbox-messages")
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload: any) => {
          // Only process messages for leads we have loaded
          const newMsg = payload.new as Message;
          if (leadIds.includes(newMsg.lead_id) || true) {
            // Accept all — we'll filter in the handler
            handleRealtimeMessage(payload);
          }
        }
      )
      .subscribe();

    // Subscribe to new leads for this org
    const leadsChannel = supabase
      .channel("inbox-leads")
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload: any) => {
          handleRealtimeLead(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(leadsChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, handleRealtimeMessage, handleRealtimeLead]);

  // ──────────────────────────────────────────
  // Manual message send (human override)
  // ──────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMessage.trim() || !selectedLeadId || sending) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      lead_id: selectedLeadId,
      direction: "outbound" as const,
      content: manualMessage.trim(),
      is_ai_generated: false,
    });

    if (!error) {
      setManualMessage("");
      // The realtime subscription will add the message to the UI
    }
    setSending(false);
  };

  // ──────────────────────────────────────────
  // Filtered leads by search query
  // ──────────────────────────────────────────
  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (lead.name || "").toLowerCase().includes(q) ||
      lead.phone_number.includes(q) ||
      lead.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  });

  // ──────────────────────────────────────────
  // Get last message for a lead (for preview)
  // ──────────────────────────────────────────
  function getLastMessage(lead: Lead): string {
    if (lead.messages.length === 0) return "No messages yet";
    return lead.messages[lead.messages.length - 1].content;
  }

  function getLastMessageTime(lead: Lead): string {
    if (lead.messages.length === 0) return "";
    return formatTime(lead.messages[lead.messages.length - 1].created_at);
  }

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────
  return (
    <div className="flex h-full w-full bg-background">
      {/* ════════════════════════════════════
          Left Column: Leads List
         ════════════════════════════════════ */}
      <div
        className={`w-full border-r sm:w-80 md:w-96 flex-shrink-0 flex flex-col h-full bg-card ${
          selectedLeadId ? "hidden sm:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold tracking-tight">
            Active Leads
          </h2>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads or messages..."
              className="pl-9 bg-muted border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <InboxIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No leads match your search."
                  : "No leads yet. They'll appear here once your WhatsApp AI receives a message."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredLeads.map((lead) => {
                const isSelected = lead.id === selectedLeadId;
                const lastMsg = getLastMessage(lead);
                const lastTime = getLastMessageTime(lead);
                const hasUnread =
                  lead.messages.length > 0 &&
                  lead.messages[lead.messages.length - 1].direction ===
                    "inbound";

                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`flex flex-col gap-2 p-4 border-b text-left transition-colors hover:bg-muted/50 ${
                      isSelected ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(lead.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm">
                            {lead.name || lead.phone_number}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {lastMsg}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {lastTime}
                        </span>
                        {hasUnread && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    {lead.tags.length > 0 && (
                      <div className="flex gap-1 pl-12 mt-1">
                        {lead.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ════════════════════════════════════
          Right Column: Chat Window
         ════════════════════════════════════ */}
      <div
        className={`flex-1 flex-col h-full ${
          selectedLeadId ? "flex" : "hidden sm:flex"
        } bg-muted/20`}
      >
        {selectedLead ? (
          <>
            {/* Chat Header */}
            <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6 bg-card">
              <div className="flex items-center gap-3">
                {/* Mobile back button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden flex-shrink-0"
                  onClick={() => setSelectedLeadId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar>
                  <AvatarFallback>
                    {getInitials(selectedLead.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {selectedLead.name || selectedLead.phone_number}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedLead.phone_number} • via WhatsApp
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs capitalize">
                {selectedLead.status}
              </Badge>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4 sm:p-6">
              <div className="flex flex-col gap-3 max-w-3xl mx-auto">
                {selectedLead.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <MessageSquareText className="w-10 h-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No messages in this conversation yet.
                    </p>
                  </div>
                ) : (
                  selectedLead.messages.map((msg) => {
                    const isInbound = msg.direction === "inbound";
                    return (
                      <div
                        key={msg.id}
                        className={`flex w-max max-w-[85%] sm:max-w-[75%] flex-col gap-1.5 rounded-lg px-4 py-3 text-sm ${
                          isInbound
                            ? "bg-muted"
                            : "self-end bg-primary text-primary-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <div
                          className={`flex items-center gap-1 self-end ${
                            isInbound ? "" : "opacity-70"
                          }`}
                        >
                          {!isInbound && msg.is_ai_generated && (
                            <Zap className="h-3 w-3" />
                          )}
                          <span
                            className={`text-[10px] ${
                              isInbound
                                ? "text-muted-foreground"
                                : ""
                            }`}
                          >
                            {formatTime(msg.created_at)}
                            {!isInbound &&
                              (msg.is_ai_generated
                                ? " • AI Auto-Reply"
                                : " • Manual")}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Chat Input — Human Override */}
            <div className="p-4 border-t bg-card">
              <form
                onSubmit={handleSendMessage}
                className="flex w-full items-center space-x-2"
              >
                <Input
                  type="text"
                  placeholder="Type to override AI... Your message will be sent directly."
                  className="flex-1"
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sending || !manualMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* No lead selected — empty state */
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <MessageSquareText className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Your Inbox</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Select a lead from the list to view their WhatsApp conversation.
                New messages will appear in real-time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
