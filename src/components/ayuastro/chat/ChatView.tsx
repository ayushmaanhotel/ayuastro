'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import { Sparkles, ArrowRight, MessageCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cosmicToast } from '@/lib/toast';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Zodiac badge helper ────────────────────────────────────────────────────

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

// ─── Suggested Questions ─────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  'What does my moon sign reveal about my emotional needs?',
  'How can I improve my relationship patterns?',
  'What are my hidden emotional strengths?',
  'How do my current transits affect me?',
];

// ─── Message entrance variants ──────────────────────────────────────────────

const aiMessageVariant = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

const userMessageVariant = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};

// ─── Typing Indicator ───────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-4">
      <motion.div
        className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/20 dark:bg-gold/10 flex items-center justify-center"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(212,175,55,0)',
            '0 0 12px 4px rgba(212,175,55,0.25)',
            '0 0 0 0 rgba(212,175,55,0)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles className="w-4 h-4 text-gold" />
      </motion.div>
      <div className="bg-white dark:bg-white/5 border border-brown-100/50 dark:border-brown-100/20 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center">
          <span className="typing-dot w-2 h-2 bg-brown-300 dark:bg-brown-400 rounded-full inline-block" />
          <span className="typing-dot w-2 h-2 bg-brown-300 dark:bg-brown-400 rounded-full inline-block" />
          <span className="typing-dot w-2 h-2 bg-brown-300 dark:bg-brown-400 rounded-full inline-block" />
        </div>
      </div>
    </div>
  );
}

// ─── Format timestamp ───────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Main ChatView ──────────────────────────────────────────────────────────

export default function ChatView() {
  const {
    birthDetails,
    astrologyData,
    numerologyData,
    traitScores,
  } = useAyuAstroStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string>(`chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  // Generate a stable session ID
  const sessionId = sessionIdRef.current;

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Build context from store data
  const buildContext = useCallback(() => {
    const topTraits = traitScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((t) => t.label);

    return {
      name: birthDetails?.name,
      sunSign: astrologyData?.sunSign,
      moonSign: astrologyData?.moonSign,
      ascendant: astrologyData?.ascendant,
      nakshatra: astrologyData?.nakshatra,
      currentDasha: astrologyData?.currentDasha,
      yogas: astrologyData?.yogas,
      doshas: astrologyData?.doshas,
      lifePathNumber: numerologyData?.lifePathNumber,
      destinyNumber: numerologyData?.destinyNumber,
      soulUrgeNumber: numerologyData?.soulUrgeNumber,
      archetype: traitScores.length > 0 ? 'Explorer' : undefined,
      topTraits,
      relationshipStatus: birthDetails?.relationshipStatus,
    };
  }, [birthDetails, astrologyData, numerologyData, traitScores]);

  // Send message
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;
    if (messageText.length > 500) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText.trim(),
          sessionId,
          context: buildContext(),
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: data.error || 'I had trouble understanding that. Could you try again?',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (data.remaining !== undefined) {
          setRemaining(data.remaining);
          if (data.remaining <= 5 && data.remaining > 0) {
            cosmicToast.info('Cosmic Counselor', `You have ${data.remaining} messages remaining in this session`);
          }
        }
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'The cosmic connection was interrupted. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, messages, sessionId, buildContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (question: string) => {
    sendMessage(question);
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setRemaining(null);
  };

  const zodiacSign = astrologyData?.sunSign || '';
  const zodiacSymbol = zodiacSign ? ZODIAC_SYMBOLS[zodiacSign] || '✨' : '✨';
  const userName = birthDetails?.name || 'Seeker';

  return (
    <div className="min-h-screen pb-24 flex flex-col bg-cream dark:bg-[#1A1412]">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-brown-50/80 to-transparent dark:from-brown-50/5 dark:to-transparent px-4 pt-4 pb-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 dark:bg-gold/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-brown-900 dark:text-brown-100">
                  Cosmic Counselor
                </h1>
                <p className="text-xs text-brown-400 dark:text-brown-300">
                  Ask about your emotional patterns & cosmic journey
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {zodiacSign && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-brown-100/50 dark:border-brown-100/20">
                  <span className="text-base leading-none">{zodiacSymbol}</span>
                  <span className="text-xs font-medium text-brown-600 dark:text-brown-300">{zodiacSign}</span>
                </div>
              )}
              {/* Clear Chat Button */}
              {messages.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleClearChat}
                  className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-brown-400 hover:text-red-500 dark:text-brown-300 dark:hover:text-red-400"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <Trash2 className="size-4" />
                </motion.button>
              )}
            </div>
          </div>
          {remaining !== null && remaining <= 5 && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 text-center">
              {remaining} messages remaining this hour
            </p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {/* Welcome Card */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-premium zodiac-corner relative border border-gold/20 rounded-2xl p-5 mb-6 shadow-sm overflow-hidden"
          >
            {/* Subtle cosmic background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/3 via-transparent to-purple-500/3 dark:from-gold/2 dark:via-transparent dark:to-purple-500/2 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gold/20 dark:bg-gold/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gold" />
                </div>
                <span className="text-sm font-semibold text-brown-900 dark:text-brown-100">Cosmic Counselor</span>
              </div>
              <p className="text-sm text-brown-700 dark:text-brown-300 leading-relaxed">
                Welcome{userName !== 'Seeker' ? `, ${userName}` : ''} to Cosmic Counselor! I&apos;m here to help you explore your emotional patterns through the lens of Vedic astrology and behavioral science. What would you like to explore today?
              </p>
            </div>
          </motion.div>
        )}

        {/* Chat Messages */}
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={msg.role === 'assistant' ? aiMessageVariant : userMessageVariant}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex items-start gap-2 mb-4 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/20 dark:bg-gold/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gold" />
                </div>
              )}

              {/* Message Bubble */}
              <div className="flex flex-col">
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brown-700 dark:bg-brown-600 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white dark:bg-white/5 border border-brown-100/50 dark:border-brown-100/20 text-brown-900 dark:text-brown-100 rounded-2xl rounded-tl-sm border-l-2 border-l-gold/40'
                  }`}
                >
                  {msg.role === 'assistant' && <span className="text-gold/50 mr-1 text-xs">✦</span>}
                  {msg.content}
                </div>
                {/* Timestamp */}
                <span className={`text-[10px] text-brown-300 dark:text-brown-500 mt-1 ${
                  msg.role === 'user' ? 'text-right mr-1' : 'ml-1'
                }`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brown-700 dark:bg-brown-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <AnimatePresence>
        {showSuggestions && messages.length === 0 && !isLoading && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-2 max-w-lg mx-auto w-full"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSuggestionClick(question)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-full border border-brown-200 dark:border-brown-100/30 bg-white/80 dark:bg-white/5 text-brown-700 dark:text-brown-300 transition-all duration-200 hover:border-gold/50 hover:shadow-[0_0_12px_rgba(212,175,55,0.15)] hover:scale-[1.02]"
                >
                  <Sparkles className="w-3 h-3 text-gold flex-shrink-0" />
                  <span className="line-clamp-1">{question}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="sticky bottom-16 glass-light border-t border-brown-100/30 dark:border-brown-100/10 px-4 py-3 z-10">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your cosmic question..."
            maxLength={500}
            disabled={isLoading}
            className="gold-focus-ring flex-1 h-11 px-4 rounded-full bg-white dark:bg-white/5 border border-brown-200 dark:border-brown-100/20 text-brown-900 dark:text-brown-100 placeholder:text-brown-300 dark:placeholder:text-brown-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`flex-shrink-0 w-11 h-11 rounded-full bg-gold hover:bg-gold/90 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${inputValue.trim() ? 'animate-breathe-glow' : ''}`}
            aria-label="Send message"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        <div className="max-w-lg mx-auto mt-1 flex justify-between items-center px-2">
          <p className="text-[10px] text-brown-300 dark:text-brown-400">
            AI guidance, not professional advice
          </p>
          <p className="text-[10px] text-brown-300 dark:text-brown-400">
            {inputValue.length}/500
          </p>
        </div>
      </div>
    </div>
  );
}
