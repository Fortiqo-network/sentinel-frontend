"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FEATURED_AGENTS_MOCK } from "@/lib/api/agents";

interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

/**
 * Client-side playground component. Manages agent selection and conversation
 * state. Sends tasks to the gateway's playground proxy endpoint.
 *
 * This component is deliberately separate from the server-rendered page so
 * the page shell remains SEO-friendly.
 *
 * TODO: wire up real gateway /v1/playground/{agentId}/invoke endpoint.
 */
export function PlaygroundClient(): React.JSX.Element {
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>("");
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const selectedAgent = FEATURED_AGENTS_MOCK.find((a) => a.id === selectedAgentId);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgentId) return;
    const userMessage: Message = { role: "user", content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      // TODO: call gateway playground proxy
      await new Promise((r) => setTimeout(r, 1200));
      const mockReply: Message = {
        role: "agent",
        content: `[Placeholder response from ${selectedAgent?.name ?? "agent"}. Gateway integration pending.]`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, mockReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "An error occurred. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Agent selector */}
      <div>
        <label htmlFor="agent-select" className="mb-1.5 block text-sm font-medium text-slate-700">
          Choose an agent
        </label>
        <select
          id="agent-select"
          value={selectedAgentId}
          onChange={(e) => {
            setSelectedAgentId(e.target.value);
            setMessages([]);
          }}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <option value="">Select an agent…</option>
          {FEATURED_AGENTS_MOCK.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.icon} {agent.name} — Trust: {agent.trustScore}
            </option>
          ))}
        </select>
      </div>

      {/* Conversation */}
      {selectedAgentId && (
        <>
          <div className="h-64 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 scrollbar-thin">
            {messages.length === 0 && (
              <p className="text-center text-sm text-slate-400 mt-8">
                Send a message to start a conversation with {selectedAgent?.name}.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-white border border-slate-200 text-slate-700"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type a task or question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-indigo-500 hover:bg-indigo-400"
            >
              Send
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
