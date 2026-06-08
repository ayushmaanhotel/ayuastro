'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAyuAstroStore } from '@/store/ayuastro-store';
import {
  ArrowLeft, Send, Phone, Video, MoreVertical,
  Circle, Trash2, Sparkles, MessageCircle, Star,
  Flame, Moon, Sun, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Astrologer {
  id: string;
  name: string;
  title: string;
  specialization: string;
  avatar: string; // emoji or initials
  avatarBg: string;
  online: boolean;
  rating: number;
  experience: string;
  description: string;
  suggestedQuestions: string[];
  systemPromptAddOn: string;
}

interface AstrologerChat {
  astrologerId: string;
  messages: ChatMessage[];
  lastActivity: Date;
}

// ─── Astrologer Data ────────────────────────────────────────────────────────

const ASTROLOGERS: Astrologer[] = [
  {
    id: 'rishi-parasher',
    name: 'Rishi Parasher',
    title: 'Vedic Scholar',
    specialization: 'Kundali Analysis & Life Path',
    avatar: '🕉️',
    avatarBg: 'from-amber-600 to-orange-700',
    online: true,
    rating: 4.9,
    experience: '35+ years',
    description: 'Master of Parashari system with deep knowledge of planetary combinations and their life impacts. Known for his no-nonsense, direct readings.',
    suggestedQuestions: [
      'What does my birth chart reveal about my life direction?',
      'How are my planetary combinations affecting my career?',
      'What remedies would you suggest for my current dasha period?',
    ],
    systemPromptAddOn: 'You are Rishi Parasher, a seasoned Vedic astrologer with 35+ years of experience in the Parashari system. You speak with authority and warmth, like a wise grandfather. You reference specific planetary positions and houses. You are direct and honest — AyuAstro\'s motto is "Nothing to Hide." You use Hindi/Sanskrit terms naturally (dasha, bhukti, graha) and explain them briefly. You occasionally share stories from your decades of practice.',
  },
  {
    id: 'jyoti-nanda',
    name: 'Jyoti Nanda',
    title: 'Relationship Expert',
    specialization: 'Love, Marriage & Compatibility',
    avatar: '💫',
    avatarBg: 'from-pink-500 to-rose-600',
    online: true,
    rating: 4.8,
    experience: '20+ years',
    description: 'Specialist in relationship astrology, synastry, and marriage timing. Known for her empathetic approach and practical relationship guidance.',
    suggestedQuestions: [
      'When will I find my life partner?',
      'What does my chart say about marriage compatibility?',
      'How can I improve my current relationship based on astrology?',
    ],
    systemPromptAddOn: 'You are Jyoti Nanda, a warm and empathetic relationship astrologer with 20+ years of experience. You specialize in love, marriage timing, and compatibility analysis. You speak like a trusted older sister — compassionate but honest. You reference Venus, 7th house, and Upapada Lagna in your analysis. You believe AyuAstro\'s motto "Nothing to Hide" means being real about relationship challenges while offering hope and solutions.',
  },
  {
    id: 'santanu-mishra',
    name: 'Santanu Mishra',
    title: 'Nakshatra Master',
    specialization: 'Nakshatra & Lunar Wisdom',
    avatar: '🌙',
    avatarBg: 'from-indigo-600 to-purple-700',
    online: false,
    rating: 4.7,
    experience: '25+ years',
    description: 'Deep expertise in Nakshatra-based analysis, lunar wisdom, and psychological astrology. Connects ancient star wisdom with modern emotional intelligence.',
    suggestedQuestions: [
      'What does my Nakshatra reveal about my personality?',
      'How does my Moon\'s Nakshatra affect my emotional world?',
      'What is the significance of my birth star in my life journey?',
    ],
    systemPromptAddOn: 'You are Santanu Mishra, a contemplative Nakshatra expert with 25+ years of deep study. You speak thoughtfully and poetically about the 27 lunar mansions. You connect star wisdom with modern psychology. You reference specific Nakshatra deities, symbols, and their psychological implications. You embody "Nothing to Hide" by showing how even challenging Nakshatra placements are invitations for growth, not curses.',
  },
  {
    id: 'dr-om-thakur',
    name: 'Dr. Om Thakur',
    title: 'Jyotish Acharya',
    specialization: 'Medical & Financial Astrology',
    avatar: '🔬',
    avatarBg: 'from-emerald-600 to-teal-700',
    online: true,
    rating: 4.9,
    experience: '30+ years',
    description: 'Holds a PhD in Jyotish and combines traditional Vedic astrology with modern analytical methods. Expert in medical and financial astrology predictions.',
    suggestedQuestions: [
      'What does my chart indicate about my health tendencies?',
      'When is a favorable period for financial investments?',
      'How can I use astrology for better decision-making in business?',
    ],
    systemPromptAddOn: 'You are Dr. Om Thakur, a methodical and analytical Jyotish Acharya with a PhD in Jyotish and 30+ years of practice. You approach astrology scientifically — referencing specific degrees, aspects, and dasha periods. You specialize in medical and financial astrology. You are precise and structured in your responses. Your "Nothing to Hide" approach means giving realistic assessments, not false hope.',
  },
  {
    id: 'anjali-tripathi',
    name: 'Anjali Tripathi',
    title: 'Spiritual Counselor',
    specialization: 'Doshas, Remedies & Spiritual Growth',
    avatar: '🙏',
    avatarBg: 'from-yellow-500 to-amber-600',
    online: true,
    rating: 4.8,
    experience: '18+ years',
    description: 'Expert in identifying and remedying doshas, karmic patterns, and spiritual blocks. Combines astrology with practical spiritual counseling and mantra therapy.',
    suggestedQuestions: [
      'What doshas are present in my birth chart?',
      'What remedies can help balance my planetary energies?',
      'How can I work with my karmic patterns for spiritual growth?',
    ],
    systemPromptAddOn: 'You are Anjali Tripathi, a warm and spiritually grounded astrologer with 18+ years of experience in dosha analysis and remedies. You speak with the authority of someone who has helped thousands overcome karmic blocks. You are practical about remedies — suggesting mantras, gemstones, and lifestyle changes. Your "Nothing to Hide" approach means being honest about which doshas are serious and which are manageable.',
  },
  {
    id: 'markandaya',
    name: 'Markandaya',
    title: 'Dasha & Timing Expert',
    specialization: 'Muhurta, Dasha & Life Timing',
    avatar: '⏳',
    avatarBg: 'from-slate-600 to-gray-700',
    online: false,
    rating: 4.7,
    experience: '40+ years',
    description: 'The most experienced astrologer on the platform. Master of Vimshottari Dasha system, Muhurta (electional astrology), and precise timing of life events.',
    suggestedQuestions: [
      'What does my current Dasha period mean for my life?',
      'When is the best time to start a new venture?',
      'How do my upcoming planetary periods affect my life decisions?',
    ],
    systemPromptAddOn: 'You are Markandaya, the most senior astrologer with 40+ years of mastery in Dasha analysis and Muhurta. You speak sparingly but every word carries weight, like a wise sage. You reference Dasha periods, Antardasha, and Pratyantardasha with precision. You believe timing is everything. Your "Nothing to Hide" philosophy means telling people when to wait and when to act — no sugarcoating.',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatLastSeen(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return formatTime(date);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2);
}

// ─── Typing Indicator (Instagram-style dots) ────────────────────────────────

function TypingIndicator({ astrologerName }: { astrologerName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-2 mb-3 px-4"
    >
      <div className="flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
        </div>
      </div>
      <div className="bg-white dark:bg-white/[0.08] border border-brown-100/40 dark:border-brown-100/15 rounded-[18px] rounded-bl-[4px] px-4 py-2.5 shadow-sm">
        <p className="text-[10px] text-brown-300 dark:text-brown-500 mb-1">{astrologerName} is writing</p>
        <div className="flex gap-1.5 items-center">
          <span className="typing-dot w-1.5 h-1.5 bg-gold dark:bg-gold-light rounded-full inline-block" />
          <span className="typing-dot w-1.5 h-1.5 bg-gold dark:bg-gold-light rounded-full inline-block" />
          <span className="typing-dot w-1.5 h-1.5 bg-gold dark:bg-gold-light rounded-full inline-block" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Astrologer List Item ───────────────────────────────────────────────────

function AstrologerListItem({
  astrologer,
  chat,
  onClick,
}: {
  astrologer: Astrologer;
  chat?: AstrologerChat;
  onClick: () => void;
}) {
  const lastMessage = chat?.messages[chat.messages.length - 1];
  const unread = 0; // Could implement unread count

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brown-50/50 dark:hover:bg-white/[0.03] transition-colors relative"
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${astrologer.avatarBg} flex items-center justify-center text-xl shadow-md`}>
          {astrologer.avatar}
        </div>
        {astrologer.online && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-cream dark:border-[#1A1412]" />
        )}
        {/* Story-like ring for online */}
        {astrologer.online && (
          <span className="absolute inset-0 rounded-full border-2 border-gold/30 animate-pulse-soft" />
        )}
      </div>

      {/* Chat info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-semibold text-sm text-brown-900 dark:text-brown-600 truncate">
            {astrologer.name}
          </h3>
          {lastMessage && (
            <span className="text-[10px] text-brown-300 dark:text-brown-500 flex-shrink-0 ml-2">
              {formatLastSeen(lastMessage.timestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[11px] text-gold-dark dark:text-gold font-medium">{astrologer.title}</span>
          <span className="text-brown-200 dark:text-brown-500">·</span>
          <span className="flex items-center gap-0.5 text-[11px] text-brown-400 dark:text-brown-500">
            <Star className="w-2.5 h-2.5 fill-gold text-gold" />
            {astrologer.rating}
          </span>
        </div>
        <p className="text-xs text-brown-400 dark:text-brown-500 truncate">
          {lastMessage
            ? lastMessage.role === 'user'
              ? `You: ${lastMessage.content}`
              : lastMessage.content
            : astrologer.specialization
          }
        </p>
      </div>

      {/* Unread indicator */}
      {unread > 0 && (
        <span className="flex-shrink-0 w-5 h-5 bg-gold rounded-full flex items-center justify-center text-[10px] text-white font-bold">
          {unread}
        </span>
      )}
    </motion.button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AstrologerChatView() {
  const {
    userId,
    birthDetails,
    astrologyData,
    numerologyData,
    traitScores,
  } = useAyuAstroStore();

  // Chat state
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [chats, setChats] = useState<Record<string, AstrologerChat>>({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(`chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chats, isLoading, selectedAstrologer, scrollToBottom]);

  // Focus input when entering chat
  useEffect(() => {
    if (selectedAstrologer) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [selectedAstrologer]);

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
  const sendMessage = useCallback(async (messageText: string, astrologer: Astrologer) => {
    if (!messageText.trim() || isLoading) return;
    if (messageText.length > 500) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setChats(prev => ({
      ...prev,
      [astrologer.id]: {
        astrologerId: astrologer.id,
        messages: [...(prev[astrologer.id]?.messages || []), userMessage],
        lastActivity: new Date(),
      }
    }));

    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const existingMessages = chats[astrologer.id]?.messages || [];
      const conversationHistory = existingMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat/astrologer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText.trim(),
          sessionId: `${sessionIdRef.current}-${astrologer.id}`,
          userId: userId || undefined,
          context: buildContext(),
          conversationHistory,
          astrologerId: astrologer.id,
          astrologerSystemPrompt: astrologer.systemPromptAddOn,
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.success ? data.response : (data.error || 'I had trouble understanding that. Could you try again?'),
        timestamp: new Date(),
      };

      setChats(prev => ({
        ...prev,
        [astrologer.id]: {
          astrologerId: astrologer.id,
          messages: [...(prev[astrologer.id]?.messages || []), assistantMessage],
          lastActivity: new Date(),
        }
      }));
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'The cosmic connection was interrupted. Please try again in a moment.',
        timestamp: new Date(),
      };
      setChats(prev => ({
        ...prev,
        [astrologer.id]: {
          astrologerId: astrologer.id,
          messages: [...(prev[astrologer.id]?.messages || []), errorMessage],
          lastActivity: new Date(),
        }
      }));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, chats, buildContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAstrologer) {
      sendMessage(inputValue, selectedAstrologer);
    }
  };

  const handleSuggestionClick = (question: string) => {
    if (selectedAstrologer) {
      sendMessage(question, selectedAstrologer);
    }
  };

  const handleClearChat = (astrologerId: string) => {
    setChats(prev => {
      const next = { ...prev };
      delete next[astrologerId];
      return next;
    });
    setShowSuggestions(true);
  };

  const userName = birthDetails?.name || 'Seeker';
  const currentChat = selectedAstrologer ? chats[selectedAstrologer.id] : null;
  const currentMessages = currentChat?.messages || [];

  // ─── RENDER: Chat List View ─────────────────────────────────────────────

  if (!selectedAstrologer) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#1A1412] pb-20">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-cream/90 dark:bg-[#1A1412]/90 backdrop-blur-xl border-b border-brown-100/30 dark:border-brown-100/10">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-2xl font-serif font-bold text-brown-900 dark:text-brown-600">
                Chat with Astrologers
              </h1>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 dark:bg-gold/5 border border-gold/20">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs font-medium text-gold-dark dark:text-gold">Live</span>
              </div>
            </div>
            <p className="text-sm text-brown-400 dark:text-brown-500">
              Choose an astrologer to start your consultation
            </p>
          </div>
        </div>

        {/* Astrologer Stories Row (Instagram-like) */}
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {ASTROLOGERS.map((astrologer) => (
              <motion.button
                key={astrologer.id}
                onClick={() => setSelectedAstrologer(astrologer)}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className={`relative w-16 h-16 rounded-full p-[2px] ${
                  astrologer.online
                    ? 'bg-gradient-to-br from-gold via-gold-light to-gold'
                    : 'bg-brown-200 dark:bg-brown-100/30'
                }`}>
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${astrologer.avatarBg} flex items-center justify-center text-2xl`}>
                    {astrologer.avatar}
                  </div>
                  {astrologer.online && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-cream dark:border-[#1A1412]" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-brown-700 dark:text-brown-500 max-w-[64px] truncate">
                  {astrologer.name.split(' ')[0]}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="max-w-lg mx-auto px-4">
          <div className="h-px bg-brown-100/50 dark:bg-brown-100/10" />
        </div>

        {/* Chat List */}
        <div className="max-w-lg mx-auto" ref={chatListRef}>
          <AnimatePresence>
            {ASTROLOGERS.map((astrologer, i) => (
              <motion.div
                key={astrologer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <AstrologerListItem
                  astrologer={astrologer}
                  chat={chats[astrologer.id]}
                  onClick={() => setSelectedAstrologer(astrologer)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── RENDER: Individual Chat View (Instagram-like) ──────────────────────

  const astrologer = selectedAstrologer;

  return (
    <div className="min-h-screen flex flex-col bg-cream dark:bg-[#1A1412]">
      {/* Chat Header */}
      <div className="sticky top-0 z-30 glass-nav">
        <div className="max-w-lg mx-auto px-3 py-2.5 flex items-center gap-3">
          {/* Back button */}
          <motion.button
            onClick={() => setSelectedAstrologer(null)}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-brown-50 dark:hover:bg-white/[0.05] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-brown-700 dark:text-brown-600" />
          </motion.button>

          {/* Astrologer avatar + info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${astrologer.avatarBg} flex items-center justify-center text-base shadow-sm`}>
                {astrologer.avatar}
              </div>
              {astrologer.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#2D2320]" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-brown-900 dark:text-brown-600 truncate">
                {astrologer.name}
              </h2>
              <div className="flex items-center gap-1.5">
                {astrologer.online ? (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Online</span>
                ) : (
                  <span className="text-[10px] text-brown-300 dark:text-brown-500">Recently active</span>
                )}
                <span className="text-brown-200 dark:text-brown-500">·</span>
                <span className="flex items-center gap-0.5 text-[10px] text-brown-400 dark:text-brown-500">
                  <Star className="w-2 h-2 fill-gold text-gold" />
                  {astrologer.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brown-50 dark:hover:bg-white/[0.05] transition-colors">
              <Phone className="w-4.5 h-4.5 text-brown-500 dark:text-brown-500" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brown-50 dark:hover:bg-white/[0.05] transition-colors">
              <Video className="w-4.5 h-4.5 text-brown-500 dark:text-brown-500" />
            </button>
            <button
              onClick={() => handleClearChat(astrologer.id)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 text-brown-400 hover:text-red-500 dark:text-brown-500 dark:hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {/* Astrologer Welcome Card */}
        {currentMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            {/* Profile Card */}
            <div className="glass-premium rounded-2xl p-5 shadow-md border border-gold/15 mb-4">
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${astrologer.avatarBg} flex items-center justify-center text-3xl shadow-lg mb-3`}>
                  {astrologer.avatar}
                </div>
                <h3 className="font-serif text-lg font-bold text-brown-900 dark:text-brown-600 mb-0.5">
                  {astrologer.name}
                </h3>
                <p className="text-xs text-gold-dark dark:text-gold font-medium mb-1">{astrologer.title}</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center gap-1 text-xs text-brown-500 dark:text-brown-500">
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    {astrologer.rating}
                  </span>
                  <span className="text-xs text-brown-300 dark:text-brown-500">·</span>
                  <span className="text-xs text-brown-500 dark:text-brown-500">{astrologer.experience}</span>
                  <span className="text-xs text-brown-300 dark:text-brown-500">·</span>
                  <span className="text-xs text-brown-500 dark:text-brown-500">{astrologer.specialization}</span>
                </div>
                <p className="text-sm text-brown-500 dark:text-brown-500 leading-relaxed">
                  {astrologer.description}
                </p>
              </div>
            </div>

            {/* Greeting message */}
            <div className="flex items-end gap-2 px-1">
              <div className="flex-shrink-0">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${astrologer.avatarBg} flex items-center justify-center text-xs`}>
                  {astrologer.avatar}
                </div>
              </div>
              <div className="bg-white dark:bg-white/[0.08] border border-brown-100/40 dark:border-brown-100/15 rounded-[18px] rounded-bl-[4px] px-4 py-2.5 shadow-sm max-w-[85%]">
                <p className="text-sm text-brown-900 dark:text-brown-600 leading-relaxed">
                  Namaste{userName !== 'Seeker' ? `, ${userName}` : ''}! 🙏 I&apos;m {astrologer.name}. I&apos;m here to give you honest, no-sugarcoating insights — because AyuAstro believes in <strong>Nothing to Hide</strong>. What would you like to explore today?
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Messages - Instagram style */}
        <AnimatePresence mode="popLayout">
          {currentMessages.map((msg, i) => {
            const showAvatar = msg.role === 'assistant' && (
              i === 0 || currentMessages[i - 1]?.role !== 'assistant'
            );
            const isLastInGroup = i === currentMessages.length - 1 || currentMessages[i + 1]?.role !== msg.role;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex items-end gap-2 mb-1 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } ${!isLastInGroup ? 'mb-0.5' : 'mb-3'}`}
              >
                {/* Astrologer Avatar */}
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-7">
                    {showAvatar && (
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${astrologer.avatarBg} flex items-center justify-center text-xs shadow-sm`}>
                        {astrologer.avatar}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div className="flex flex-col max-w-[78%]">
                  <div
                    className={`px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-brown-700 to-brown-800 dark:from-gold/90 dark:to-gold text-white dark:text-brown-900 rounded-[18px] rounded-br-[4px]'
                        : `bg-white dark:bg-white/[0.08] border border-brown-100/40 dark:border-brown-100/15 text-brown-900 dark:text-brown-600 rounded-[18px] rounded-bl-[4px]`
                    }`}
                  >
                    {msg.content}
                  </div>
                  {/* Timestamp - only on last in group */}
                  {isLastInGroup && (
                    <span className={`text-[10px] text-brown-300 dark:text-brown-500 mt-1 ${
                      msg.role === 'user' ? 'text-right mr-1' : 'ml-1'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-7">
                    {isLastInGroup && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brown-700 to-brown-800 dark:from-gold dark:to-gold-light flex items-center justify-center shadow-sm">
                        <MessageCircle className="w-3.5 h-3.5 text-white dark:text-brown-900" />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isLoading && <TypingIndicator astrologerName={astrologer.name.split(' ')[0]} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <AnimatePresence>
        {showSuggestions && currentMessages.length === 0 && !isLoading && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-2 max-w-lg mx-auto w-full"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {astrologer.suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSuggestionClick(question)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-full border border-brown-200 dark:border-brown-100/30 bg-white/80 dark:bg-white/[0.08] text-brown-700 dark:text-brown-500 transition-all duration-200 hover:border-gold/50 hover:shadow-[0_0_12px_rgba(212,175,55,0.15)] hover:scale-[1.02]"
                >
                  <Sparkles className="w-3 h-3 text-gold flex-shrink-0" />
                  <span className="line-clamp-1">{question}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area - Instagram style */}
      <div className="sticky bottom-16 glass-light border-t border-brown-100/30 dark:border-brown-100/10 px-3 py-2.5 z-10">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white dark:bg-white/[0.08] border border-brown-200 dark:border-brown-100/20 rounded-full px-4 py-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Message ${astrologer.name.split(' ')[0]}...`}
              maxLength={500}
              disabled={isLoading}
              className="flex-1 h-9 bg-transparent text-brown-900 dark:text-brown-600 placeholder:text-brown-300 dark:placeholder:text-brown-400 text-sm disabled:opacity-50 outline-none"
            />
            <span className="text-[10px] text-brown-200 dark:text-brown-500 ml-2 flex-shrink-0">
              {inputValue.length > 0 ? `${inputValue.length}/500` : ''}
            </span>
          </div>
          <motion.button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            whileTap={{ scale: 0.9 }}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 transition-all duration-200 ${
              inputValue.trim()
                ? 'bg-gradient-to-br from-gold to-gold-dark hover:shadow-lg text-white shadow-md'
                : 'bg-brown-100 dark:bg-brown-100/20 text-brown-300 dark:text-brown-500'
            }`}
            aria-label="Send message"
          >
            <Send className="w-4.5 h-4.5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
