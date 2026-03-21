"use client"
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGUCStore } from "@/lib/store";

interface Message {
  id: string;
  text: string;
  sender: "user" | "doctor";
}

interface DoctorChatProps {
  onSend: (message: string) => Promise<string>;
}

const suggestions = [
  "क्या मैं चावल खा सकता हूँ?",
  "मुझे क्या खाना चाहिए?",
  "यह कितना गंभीर है?",
];

const BouncingDots = () => (
  <div className="flex items-start">
    <div className="rounded-2xl px-4 py-3 bg-[#1e293b] flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-2 h-2 rounded-full bg-[#94a3b8]"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  </div>
);

const DoctorChat: React.FC<DoctorChatProps> = ({ onSend }) => {
  const { profile } = useGUCStore()
  const language = profile.language === "HI" ? "hindi" : "english"

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const reply = await onSend(text);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: reply, sender: "doctor" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।",
          sender: "doctor",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 left-64 z-50 rounded-full px-5 py-3 font-bold text-sm shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: "#FF9933", color: "#000" }}
      >
        {open ? "✕" : "💬 Dr. Raahat"}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-full w-full sm:w-96 flex flex-col"
              style={{ backgroundColor: "#0F172A", borderLeft: "1px solid #334155" }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "#334155" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🩺</span>
                    <span className="font-bold text-lg" style={{ color: "#FF9933" }}>
                      Dr. Raahat
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                    Aapka AI Doctor
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-lg hover:opacity-80"
                  style={{ color: "#94a3b8" }}
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && !loading && (
                  <div className="flex flex-col gap-2 mt-8">
                    <p
                      className="text-center text-sm mb-2"
                      style={{ color: "#94a3b8" }}
                    >
                      {language === "hindi" ? "कुछ पूछें:" : "Ask something:"}
                    </p>
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-xl px-4 py-2.5 text-sm text-left transition-colors hover:opacity-90"
                        style={{
                          backgroundColor: "#1e293b",
                          color: "#e2e8f0",
                          border: "1px solid #334155",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                      style={
                        msg.sender === "user"
                          ? {
                            backgroundColor: "#1e293b",
                            borderLeft: "3px solid #FF9933",
                            color: "#e2e8f0",
                          }
                          : { backgroundColor: "#1e293b", color: "#e2e8f0" }
                      }
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {loading && <BouncingDots />}
                <div ref={bottomRef} />
              </div>

              <div
                className="px-3 py-3 flex items-center gap-2 border-t"
                style={{ borderColor: "#334155" }}
              >
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full text-lg shrink-0 hover:opacity-80"
                  style={{ backgroundColor: "#1e293b", color: "#94a3b8" }}
                >
                  🎤
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder={
                    language === "hindi"
                      ? "अपना सवाल लिखें..."
                      : "Type your question..."
                  }
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#e2e8f0",
                    border: "2px solid transparent",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#FF9933")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                />
                <button
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-lg shrink-0 font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#FF9933", color: "#000" }}
                >
                  →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DoctorChat;