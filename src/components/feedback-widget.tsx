"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Send } from "lucide-react";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, name, email }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("");
        setName("");
        setEmail("");
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-primary text-primary-foreground rounded-full p-3.5 md:p-4 shadow-lg hover:scale-110 transition-transform z-50"
        aria-label="Send feedback"
      >
        <div className="flex items-center gap-2">
        <MessageSquare className="size-4 md:size-5" />
        <span className="hidden md:inline">Feedback</span>
        </div>

      </button>

      {/* Feedback modal */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 md:bottom-6 md:right-6 md:left-auto bg-background border rounded-lg shadow-xl md:w-80 z-50 dark:bg-gray-900">
          <div className="flex items-center justify-between p-3 md:p-4 border-b">
            <h3 className="font-semibold text-sm md:text-base">Send a message to Ryan</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-3 md:p-4 space-y-2 md:space-y-3">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full p-2 md:p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full p-2 md:p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                disabled={isSubmitting}
              />
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Share your thoughts, report a bug, suggest a feature or just say hi!"
              className="w-full h-24 md:h-32 p-2 md:p-3 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              disabled={isSubmitting}
              required
            />

            {status === "success" && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Feedback sent successfully!
              </p>
            )}

            {status === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to send feedback. Please try again.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !message.trim()}
            >
              <Send className="size-4" />
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
