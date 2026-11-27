import React, { useEffect, useRef, useState } from 'react';
import { History, MessageSquare, Phone, Plus, Send, X } from 'lucide-react';
import type { ChatMessage, ChatSession } from '../types/clinic.ts';

interface FloatingConciergeProps {
  phone: string;
  phoneHref: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onBookFromChat: () => void;
}

const STORAGE_KEY = 'auradental_chat_history_v1';
const MAX_STORED_DIALOGUES = 2;

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Здравствуйте! Я помощник клиники «Первая Детская Стоматология». Подскажу, как подготовить малыша к первому визиту без слёз, какие мультики есть на потолке и сколько стоит бережное лечение.',
  timestamp: new Date().toISOString(),
};

function createNewSession(): ChatSession {
  const uid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id: `dlg-${uid}`,
    title: 'Новый диалог',
    updatedAt: new Date().toISOString(),
    messages: [{ ...INITIAL_ASSISTANT_MESSAGE, id: `msg-${uid}` }],
  };
}

function loadLastTwoSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [createNewSession()];
    const parsed = JSON.parse(raw) as ChatSession[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [createNewSession()];
    return parsed.slice(0, MAX_STORED_DIALOGUES);
  } catch {
    return [createNewSession()];
  }
}

export const FloatingConcierge: React.FC<FloatingConciergeProps> = ({
  phone,
  phoneHref,
  isOpen,
  onToggle,
  onBookFromChat,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadLastTwoSessions());
  const [activeId, setActiveId] = useState<string>(() => sessions[0]?.id ?? '');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showCallTooltip, setShowCallTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0];

  // Persist strictly the last 2 dialogues in localStorage
  useEffect(() => {
    try {
      const trimmed = sessions.slice(0, MAX_STORED_DIALOGUES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // ignore storage quota errors
    }
  }, [sessions]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeSession?.messages.length]);

  const handleStartNewDialogue = () => {
    if (loading) return;
    const fresh = createNewSession();
    setSessions((prev) => [fresh, ...prev].slice(0, MAX_STORED_DIALOGUES));
    setActiveId(fresh.id);
    setShowHistory(false);
    setError('');
  };

  const handleSend = async (e?: React.FormEvent, quickPrompt?: string) => {
    e?.preventDefault();
    const text = (quickPrompt ?? input).trim();
    if (!text || loading || !activeSession) return;

    const targetSessionId = activeSession.id;
    setError('');
    if (!quickPrompt) setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now().toString(36)}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...activeSession.messages, userMsg];
    const derivedTitle =
      activeSession.title === 'Новый диалог'
        ? text.slice(0, 34) + (text.length > 34 ? '…' : '')
        : activeSession.title;

    setSessions((prev) =>
      prev
        .map((s) =>
          s.id === targetSessionId
            ? { ...s, title: derivedTitle, updatedAt: new Date().toISOString(), messages: nextMessages }
            : s
        )
        .slice(0, MAX_STORED_DIALOGUES)
    );

    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setError(data.error || 'Не удалось получить ответ. Попробуйте позже или позвоните в клинику.');
        return;
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now().toString(36)}`,
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toISOString(),
      };

      setSessions((prev) =>
        prev
          .map((s) =>
            s.id === targetSessionId
              ? {
                  ...s,
                  updatedAt: new Date().toISOString(),
                  messages: [...s.messages, assistantMsg],
                }
              : s
          )
          .slice(0, MAX_STORED_DIALOGUES)
      );
    } catch {
      setError('Ошибка соединения с сервером консультаций.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Desktop Floating Quick Call + Chat Triggers */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-3">
        <div className="relative">
          {showCallTooltip && (
            <div className="absolute bottom-full right-0 mb-2 w-60 rounded-2xl bg-white border-2 border-sky-200 p-4 shadow-2xl text-xs text-[#132347]">
              <p className="font-extrabold">Линия «Первая Детская Стоматология»</p>
              <p className="mt-1 text-slate-700 tabular-nums font-semibold">{phone}</p>
              <a
                href={phoneHref}
                className="mt-3 inline-flex items-center justify-center w-full min-h-[38px] rounded-xl bg-[#1D4ED8] text-white font-bold hover:bg-[#1E40AF]"
              >
                Позвонить сейчас
              </a>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowCallTooltip((v) => !v)}
            className="w-12 h-12 rounded-full bg-white border-2 border-sky-200 text-[#132347] shadow-xl flex items-center justify-center hover:border-[#1D4ED8] transition-colors cursor-pointer"
            aria-label="Быстрый вызов клиники"
            title={`Быстрый вызов: ${phone}`}
          >
            <Phone className="w-5 h-5 text-[#10B981]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onToggle(!isOpen)}
          className="h-12 px-5 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#0284C7] text-white shadow-2xl border-2 border-[#FBBF24]/65 flex items-center gap-2.5 text-sm font-extrabold hover:brightness-105 transition-all cursor-pointer"
          aria-expanded={isOpen}
          aria-label="Открыть помощник для родителей"
        >
          <MessageSquare className="w-4 h-4 text-[#FDE047]" />
          <span>Вопрос врачу</span>
        </button>
      </div>

      {/* Chat Drawer */}
      {isOpen && (
        <div
          className="fixed inset-x-3 bottom-16 md:inset-x-auto md:bottom-22 md:right-6 z-50 md:w-[410px] h-[72dvh] max-h-[560px] rounded-3xl bg-white border-2 border-sky-200 shadow-[0_28px_70px_-15px_rgba(29,78,216,0.32)] flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Помощник для родителей Первая Детская Стоматология"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#1D4ED8] via-[#0284C7] to-[#0D9488] text-white border-b border-white/20 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <p className="font-display text-base font-extrabold tracking-tight text-white truncate">
                Первая Детская Стоматология
              </p>
              <p className="text-[11px] text-[#FEF08A] font-semibold">
                Забота о детских улыбках 24/7
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                className="min-w-[38px] min-h-[38px] rounded-lg hover:bg-white/10 flex items-center justify-center text-white/90 cursor-pointer"
                title="Последние 2 диалога"
                aria-label="История последних двух диалогов"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleStartNewDialogue}
                disabled={loading}
                className="min-w-[38px] min-h-[38px] rounded-lg hover:bg-white/10 disabled:opacity-40 flex items-center justify-center text-white/90 cursor-pointer"
                title="Новый диалог"
                aria-label="Начать новый диалог"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onToggle(false)}
                className="min-w-[38px] min-h-[38px] rounded-lg hover:bg-white/10 flex items-center justify-center text-white/90 cursor-pointer"
                aria-label="Закрыть чат"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Last 2 Dialogues History Switcher */}
          {showHistory && (
            <div className="px-4 py-3 bg-sky-50/80 border-b border-sky-200 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#132347]">
                  История (последние {sessions.length} из 2 диалогов)
                </span>
                <button
                  type="button"
                  onClick={handleStartNewDialogue}
                  disabled={loading}
                  className="text-xs font-bold text-[#1D4ED8] hover:underline disabled:opacity-40 cursor-pointer"
                >
                  + Новый
                </button>
              </div>
              <div className="space-y-1.5">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setActiveId(s.id);
                      setShowHistory(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      s.id === activeSession.id
                        ? 'bg-[#1D4ED8] text-white'
                        : 'bg-white border border-sky-200 text-[#132347] hover:border-[#1D4ED8]'
                    }`}
                  >
                    <span className="truncate font-semibold">{s.title}</span>
                    <span className="text-[10px] opacity-75 shrink-0 tabular-nums">
                      {s.messages.length} сообщ.
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-sky-50/40">
            {activeSession.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1D4ED8] text-white rounded-br-sm shadow-sm'
                      : 'bg-white border border-sky-200 text-[#132347] rounded-bl-sm shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white border border-sky-200 px-4 py-2.5 text-xs font-semibold text-[#1D4ED8]">
                  Подбираю бережный ответ...
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts */}
          {activeSession.messages.length <= 2 && (
            <div className="px-4 py-2 bg-sky-50/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {['Первый визит в 3 года', 'Мультики и закись азота', 'Сколько стоит профгигиена?'].map(
                (q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(undefined, q)}
                    className="px-3 py-1.5 rounded-xl border border-sky-200 bg-white text-[11px] font-bold text-[#132347] hover:border-[#1D4ED8] hover:bg-sky-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {q}
                  </button>
                )
              )}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => handleSend(e)}
            className="p-3 bg-white border-t border-sky-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Спросите про возраст, адаптацию или цены..."
              className="flex-1 min-h-[42px] px-3.5 rounded-xl border border-sky-200 bg-white text-xs sm:text-sm text-[#132347] placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="min-w-[42px] min-h-[42px] rounded-xl bg-[#FBBF24] text-[#132347] flex items-center justify-center hover:bg-[#F59E0B] disabled:opacity-45 cursor-pointer shadow-xs"
              aria-label="Отправить сообщение"
            >
              <Send className="w-4 h-4 text-[#132347]" />
            </button>
          </form>

          <div className="px-3 pb-2.5 bg-white flex items-center justify-between text-[11px] text-slate-600 shrink-0">
            <button
              type="button"
              onClick={() => {
                onToggle(false);
                onBookFromChat();
              }}
              className="font-bold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Записать ребёнка
            </button>
            <a href={phoneHref} className="hover:text-[#1D4ED8] font-semibold tabular-nums">
              {phone}
            </a>
          </div>
        </div>
      )}
    </>
  );
};
