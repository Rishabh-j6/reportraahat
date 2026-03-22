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
        className="fixed bottom-5 left-64 z-50 rounded-full px-5 py-2.5 font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        style={{
          backgroundColor: open ? "rgba(255,153,51,0.9)" : "#FF9933",
          color: "#0d0d1a",
          boxShadow: "0 4px 20px rgba(255,153,51,0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        {open ? "✕ Close" : "💬 Dr. Raahat"}
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
              style={{
                background: "rgba(10,10,20,0.96)",
                borderLeft: "1px solid rgba(255,153,51,0.1)",
                backdropFilter: "blur(24px)",
                boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(255,153,51,0.15)", border: "1px solid rgba(255,153,51,0.25)" }}
                    >
                      🩺
                    </div>
                    <div>
                      <span className="font-bold text-base" style={{ color: "#FF9933" }}>
                        Dr. Raahat
                      </span>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Aapka AI Doctor • Online
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-sm transition-all hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && !loading && (
                  <div className="flex flex-col gap-2 mt-8">
                    <p
                      className="text-center text-xs mb-3 font-medium"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {language === "hindi" ? "कुछ पूछें:" : "Ask something:"}
                    </p>
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-xl px-4 py-3 text-sm text-left transition-all hover:opacity-80"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          color: "rgba(255,255,255,0.8)",
                          border: "1px solid rgba(255,255,255,0.08)",
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
                            background: "rgba(255,153,51,0.12)",
                            borderLeft: "3px solid #FF9933",
                            color: "rgba(255,255,255,0.9)",
                          }
                          : {
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.85)",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }
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
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full text-lg shrink-0 hover:opacity-80 transition-opacity"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
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
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.9)",
                    border: "2px solid transparent",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,153,51,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                />
                <button
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-lg shrink-0 font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #FF9933 0%, #FFAA55 100%)",
                    color: "#0d0d1a",
                    boxShadow: "0 2px 12px rgba(255,153,51,0.3)",
                  }}
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