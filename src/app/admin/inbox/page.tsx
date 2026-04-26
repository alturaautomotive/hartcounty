"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import MessageBubble from "@/components/MessageBubble";
import { relativeTime } from "@/lib/utils";

type Contact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  fbSenderId: string | null;
  tags: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  messages: { id: string; body: string; sentAt: string; direction: string; readAt: string | null }[];
};

type Message = {
  id: string;
  contactId: string;
  channel: string;
  direction: string;
  body: string;
  sentAt: string;
  readAt: string | null;
};

const SOURCE_COLORS: Record<string, string> = {
  messenger_lead: "bg-purple-100 text-purple-800",
  messenger_message: "bg-blue-100 text-blue-800",
  manual: "bg-neutral-100 text-neutral-800",
};

function contactName(c: Contact) {
  return `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Unknown";
}

function initials(c: Contact) {
  const f = c.firstName?.[0] ?? "";
  const l = c.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

type Tab = "all" | "unread" | "leads" | "messages";

export default function InboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialContactId = searchParams.get("contactId");

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialContactId);
  const [thread, setThread] = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [subscriberLoading, setSubscriberLoading] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  const showToast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [{ id, message }, ...prev.slice(0, 1)]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
  }, []);

  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  // Fetch contacts list
  const fetchContacts = useCallback(async () => {
    const res = await fetch("/api/contacts");
    if (res.ok) {
      const data: Contact[] = await res.json();
      setContacts(data);
    }
    setContactsLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Fetch thread for selected contact
  const fetchThread = useCallback(async (contactId: string) => {
    setThreadLoading(true);
    const res = await fetch(`/api/inbox/messages?contactId=${contactId}`);
    if (res.ok) {
      const { messages, contact: updatedContact } = await res.json();
      setThread(messages);
      if (updatedContact) {
        setContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, ...updatedContact } : c))
        );
      }
    }
    setThreadLoading(false);
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchThread(selectedId);
    } else {
      setThread([]);
    }
  }, [selectedId, fetchThread]);

  // Supabase Realtime: per-contact Message INSERT + Contact UPDATE
  useEffect(() => {
    if (!selectedId) return;

    const contactChannel = supabase
      .channel(`inbox-${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `contactId=eq.${selectedId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setThread((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Auto-mark inbound messages as read
          if (newMsg.direction === "INBOUND") {
            fetch("/api/inbox/messages/read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messageId: newMsg.id }),
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Contact",
          filter: `id=eq.${selectedId}`,
        },
        (payload) => {
          const updated = payload.new as Contact;
          setContacts((prev) => {
            const existing = prev.find((c) => c.id === selectedId);
            if (updated.phone && (existing?.phone ?? null) === null) {
              showToast(
                `Phone number detected and saved: ${updated.phone}`
              );
            }
            if (updated.email && (existing?.email ?? null) === null) {
              showToast(
                `Email detected and saved: ${updated.email}`
              );
            }
            return prev.map((c) =>
              c.id === selectedId ? { ...c, ...updated } : c
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contactChannel);
    };
  }, [selectedId, supabase, showToast]);

  // Supabase Realtime: global Message INSERT for unread dots
  useEffect(() => {
    const listChannel = supabase
      .channel("inbox-list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.direction !== "INBOUND") return;
          // If this message is for the currently-viewed contact, skip (handled above)
          if (newMsg.contactId === selectedId) return;
          setContacts((prev) =>
            prev.map((c) =>
              c.id === newMsg.contactId
                ? {
                    ...c,
                    messages: [
                      {
                        id: newMsg.id,
                        body: newMsg.body,
                        sentAt: newMsg.sentAt,
                        direction: newMsg.direction,
                        readAt: null,
                      },
                      ...c.messages,
                    ],
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listChannel);
    };
  }, [supabase, selectedId]);

  // Auto-scroll thread
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const selected = contacts.find((c) => c.id === selectedId) ?? null;

  // Initialize notes editing when contact changes
  useEffect(() => {
    if (selected) {
      setEditingNotes(selected.notes ?? "");
    }
  }, [selected]);

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      const name = contactName(c).toLowerCase();
      if (!name.includes(q) && !(c.email ?? "").toLowerCase().includes(q)) return false;
    }
    if (tab === "unread") {
      return c.messages.some((m) => m.direction === "INBOUND" && !m.readAt);
    }
    if (tab === "leads") return c.source === "messenger_lead";
    if (tab === "messages") return c.source === "messenger_message";
    return true;
  });

  async function handleReply() {
    if (!replyText.trim() || !selectedId) return;
    setSending(true);

    // Optimistic append
    const optimisticMsg: Message = {
      id: `optimistic-${Date.now()}`,
      contactId: selectedId,
      channel: "MESSENGER",
      direction: "OUTBOUND",
      body: replyText.trim(),
      sentAt: new Date().toISOString(),
      readAt: null,
    };
    setThread((prev) => [...prev, optimisticMsg]);
    const sentText = replyText.trim();
    setReplyText("");

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: selectedId, body: sentText }),
    });

    if (!res.ok) {
      // Remove optimistic message on failure
      setThread((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setReplyText(sentText);
      alert("Failed to send message");
    }
    setSending(false);
  }

  async function saveNotes() {
    if (!selected || editingNotes === null) return;
    await fetch(`/api/contacts/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: editingNotes }),
    });
  }

  async function addTag() {
    if (!selected || !tagInput.trim()) return;
    const newTags = [...selected.tags, tagInput.trim()];
    const res = await fetch(`/api/contacts/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: newTags }),
    });
    if (res.ok) {
      setContacts((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, tags: newTags } : c))
      );
      setTagInput("");
    }
  }

  async function removeTag(tag: string) {
    if (!selected) return;
    const newTags = selected.tags.filter((t) => t !== tag);
    const res = await fetch(`/api/contacts/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: newTags }),
    });
    if (res.ok) {
      setContacts((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, tags: newTags } : c))
      );
    }
  }

  const QUICK_TAGS = ["lead", "follow-up", "adopter", "volunteer", "foster"];

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {/* Left panel - Contact list */}
      <div className="flex w-80 shrink-0 flex-col border-r border-neutral-200">
        <div className="border-b border-neutral-200 p-3">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <div className="mt-2 flex gap-1">
            {(["all", "unread", "leads", "messages"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition ${
                  tab === t
                    ? "bg-blue-100 text-blue-700"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contactsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-neutral-400">
              No contacts found.
            </p>
          ) : (
            filteredContacts.map((c) => {
              const lastMsg = c.messages[0];
              const hasUnread = c.messages.some(
                (m) => m.direction === "INBOUND" && !m.readAt
              );
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedId(c.id);
                    router.replace(`/admin/inbox?contactId=${c.id}`, {
                      scroll: false,
                    });
                  }}
                  className={`flex w-full items-start gap-3 border-b border-neutral-100 px-3 py-3 text-left transition hover:bg-neutral-50 ${
                    selectedId === c.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                    {initials(c)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-neutral-900">
                        {contactName(c)}
                      </span>
                      <span className="ml-2 shrink-0 text-[10px] text-neutral-400">
                        {lastMsg
                          ? relativeTime(lastMsg.sentAt)
                          : relativeTime(c.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {lastMsg
                        ? lastMsg.body.slice(0, 60)
                        : "No messages yet"}
                    </p>
                  </div>
                  {hasUnread && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Center - Thread */}
      <div className="flex flex-1 flex-col">
        {!selectedId ? (
          <div className="flex flex-1 items-center justify-center text-neutral-400">
            Select a contact to view the conversation
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                {selected ? initials(selected) : "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {selected ? contactName(selected) : "Loading..."}
                </p>
                {selected?.source && (
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      SOURCE_COLORS[selected.source] ?? "bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    {selected.source.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {threadLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              ) : thread.length === 0 ? (
                <p className="py-12 text-center text-sm text-neutral-400">
                  No messages yet. Send the first message below.
                </p>
              ) : (
                thread.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.direction === "OUTBOUND"}
                  />
                ))
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Reply bar */}
            <div className="border-t border-neutral-200 px-4 py-3">
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={3}
                  className="flex-1 resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="self-end rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right sidebar - Contact details */}
      <div className="hidden w-72 shrink-0 flex-col border-l border-neutral-200 lg:flex">
        {selected ? (
          <div className="flex-1 overflow-y-auto p-4">
            {/* Contact info */}
            <div className="mb-4 flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-200 text-lg font-bold text-neutral-600">
                {initials(selected)}
              </div>
              <h3 className="mt-2 text-sm font-bold text-neutral-900">
                {contactName(selected)}
              </h3>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  SOURCE_COLORS[selected.source] ?? "bg-neutral-100 text-neutral-800"
                }`}
              >
                {selected.source.replace(/_/g, " ")}
              </span>
            </div>

            {/* Contact details */}
            <div className="space-y-3 text-sm">
              {selected.email && (
                <div>
                  <p className="text-xs font-medium text-neutral-400">Email</p>
                  <p className="text-neutral-700">{selected.email}</p>
                </div>
              )}
              {selected.phone && (
                <div>
                  <p className="text-xs font-medium text-neutral-400">Phone</p>
                  <p className="text-neutral-700">{selected.phone}</p>
                </div>
              )}
              {selected.fbSenderId && (
                <div>
                  <p className="text-xs font-medium text-neutral-400">
                    Messenger ID
                  </p>
                  <p className="truncate text-neutral-700">
                    {selected.fbSenderId}
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-neutral-400">Tags</p>
              <div className="flex flex-wrap gap-1">
                {selected.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                  >
                    {t}
                    <button
                      onClick={() => removeTag(t)}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              {/* Quick tags */}
              <div className="mt-2 flex flex-wrap gap-1">
                {QUICK_TAGS.filter((t) => !selected.tags.includes(t)).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTagInput(t);
                        // Immediately add
                        const newTags = [...selected.tags, t];
                        fetch(`/api/contacts/${selected.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ tags: newTags }),
                        }).then((res) => {
                          if (res.ok) {
                            setContacts((prev) =>
                              prev.map((c) =>
                                c.id === selected.id
                                  ? { ...c, tags: newTags }
                                  : c
                              )
                            );
                          }
                        });
                        setTagInput("");
                      }}
                      className="rounded-full border border-dashed border-neutral-300 px-2 py-0.5 text-[10px] text-neutral-400 hover:border-blue-400 hover:text-blue-500"
                    >
                      + {t}
                    </button>
                  )
                )}
              </div>
              {/* Custom tag input */}
              <div className="mt-2 flex gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag..."
                  className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="shrink-0 rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-200 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-neutral-400">Notes</p>
              <textarea
                value={editingNotes ?? ""}
                onChange={(e) => setEditingNotes(e.target.value)}
                onBlur={saveNotes}
                rows={4}
                placeholder="Add notes about this contact..."
                className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Add to Subscribers toggle */}
            {selected.email && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-neutral-400">
                    Add to Subscribers
                  </p>
                  <button
                    disabled={subscriberLoading}
                    onClick={async () => {
                      setSubscriberLoading(true);
                      if (!isSubscriber) {
                        const res = await fetch("/api/subscribers", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email: selected.email,
                            firstName: selected.firstName,
                            source: "manual",
                          }),
                        });
                        if (res.ok || res.status === 409) {
                          setIsSubscriber(true);
                        }
                      } else {
                        const res = await fetch(
                          `/api/subscribers?email=${encodeURIComponent(selected.email!)}`,
                          { method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ unsubscribed: true }),
                          }
                        );
                        if (res.ok) {
                          setIsSubscriber(false);
                        }
                      }
                      setSubscriberLoading(false);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
                      isSubscriber ? "bg-blue-600" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        isSubscriber ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-4 text-sm text-neutral-400">
            Select a contact to view details
          </div>
        )}
      </div>
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
        {toasts.map(({ id, message }) => (
          <div
            key={id}
            className="max-w-sm rounded-lg bg-neutral-800 px-4 py-2.5 text-xs text-white shadow-2xl backdrop-blur-sm animate-slideIn"
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}
