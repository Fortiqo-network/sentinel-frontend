"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listAgents } from "@/lib/api/agents";
import { cn } from "@/lib/utils/cn";
import type { Agent } from "@/types/agent";

interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

const PREVIEW_REPLY =
  "Live agent execution isn't available in the playground yet — this is a preview. " +
  "Use the marketplace 'Use agent' flow to run a real, charged call.";

/**
 * Client-side playground component. Lists real verified agents and lets users
 * compose messages against a selected agent.
 *
 * Live execution is intentionally not wired: no credits are charged.
 * Sending a message appends an obvious preview reply.
 *
 * @example
 * <PlaygroundClient />
 */
export function PlaygroundClient(): React.JSX.Element {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [isFetchingAgents, setIsFetchingAgents] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>("");
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  React.useEffect(() => {
    let active = true;
    setIsFetchingAgents(true);
    setFetchError(null);
    listAgents({ sort: "trust_desc", pageSize: 20, page: 1 })
      .then((response) => {
        if (!active) return;
        setAgents(response.agents);
      })
      .catch(() => {
        if (!active) return;
        setFetchError("We couldn't load agents right now. Please try again later.");
      })
      .finally(() => {
        if (!active) return;
        setIsFetchingAgents(false);
      });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !selectedAgentId) return;
    const userMessage: Message = { role: "user", content: input.trim(), timestamp: new Date() };
    const previewReply: Message = { role: "agent", content: PREVIEW_REPLY, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage, previewReply]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatOption = (agent: Agent): string => {
    const parts = [agent.name, `Trust: ${agent.trustScore}`];
    if (agent.pricing?.priceCredits !== undefined) {
      parts.push(`${agent.pricing.priceCredits} Cr/call`);
    }
    return parts.join(" — ");
  };

  return (
    <div className="space-y-4">
      {/* Agent selector */}
      <div>
        <label
          htmlFor="agent-select"
          className="mb-1.5 block font-brand-mono text-xs uppercase tracking-[0.18em] text-gold/80"
        >
          Choose an agent
        </label>

        {isFetchingAgents ? (
          <div className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-porcelain/40">
            Loading agents…
          </div>
        ) : fetchError ? (
          <div className="w-full rounded-lg border border-red-700/40 bg-red-900/20 px-3 py-2 text-sm text-red-400">
            {fetchError}
          </div>
        ) : agents.length === 0 ? (
          <div className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-porcelain/40">
            No agents are available yet.
          </div>
        ) : (
          <select
            id="agent-select"
            value={selectedAgentId}
            onChange={(e) => {
              setSelectedAgentId(e.target.value);
              setMessages([]);
            }}
            className="w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-porcelain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            <option value="">Select an agent…</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.icon ? `${agent.icon} ` : ""}
                {formatOption(agent)}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedAgentId && (
        <>
          {/* Message thread */}
          <div className="h-64 space-y-3 overflow-y-auto rounded-xl border border-porcelain/10 bg-ink-800/50 p-4 scrollbar-thin">
            {messages.length === 0 && (
              <p className="mt-8 text-center text-sm text-porcelain/35">
                Send a message to start a conversation with {selectedAgent?.name}.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-gold/90 font-medium text-ink-950"
                      : "border border-porcelain/10 bg-ink-700 text-porcelain/70",
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input row */}
          <div className="flex gap-2">
            <Input
              placeholder="Type a task or question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              variant="dark"
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="bg-gold text-ink-950 hover:bg-gold/85 focus-visible:ring-gold"
            >
              Send
            </Button>
          </div>

          <p className="text-xs text-porcelain/35">
            Preview only — the playground does not run agents or charge credits.
          </p>
        </>
      )}
    </div>
  );
}
