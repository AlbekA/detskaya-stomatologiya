import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Download, Lock, LogOut, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import type {
  BookingItem,
  BookingStatus,
  ClinicContent,
  DoctorItem,
  ServiceCategory,
  ServiceItem,
} from '../types/clinic.ts';

interface AdminPanelProps {
  content: ClinicContent;
  onContentSaved: (next: ClinicContent) => void;
  onExit: () => void;
}

type AdminTab = 'bookings' | 'services' | 'doctors' | 'cases' | 'settings';

const STATUS_LABELS: Record<BookingStatus, string> = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  completed: 'Завершена',
  cancelled: 'Отменена',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  new: 'text-[#0284C7]',
  confirmed: 'text-emerald-700',
  completed: 'text-[#132347]',
  cancelled: 'text-red-700',
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  content,
  onContentSaved,
  onExit,
}) => {
  // Token kept strictly in React memory (never localStorage/sessionStorage)
  const [token, setToken] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'loading' | 'unclaimed' | 'env' | 'claimed'>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [draftContent, setDraftContent] = useState<ClinicContent>(content);
  const [savingMsg, setSavingMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setDraftContent(content);
  }, [content]);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then((data: { mode?: 'env' | 'claimed' | 'unclaimed' }) => {
        if (active) setAuthMode(data.mode || 'claimed');
      })
      .catch(() => {
        if (active) setAuthMode('claimed');
      });
    return () => {
      active = false;
    };
  }, []);

  const loadBookings = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        setToken(null);
        return;
      }
      const data = (await res.json()) as { bookings?: BookingItem[] };
      if (Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch {
      setErrorMsg('Не удалось загрузить заявки.');
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadBookings(token);
    }
  }, [token, loadBookings]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'unclaimed') {
      if (password.trim().length < 8) {
        setAuthError('Придумайте пароль длиной не менее 8 символов.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Пароли не совпадают.');
        return;
      }
    }

    setAuthSubmitting(true);
    try {
      const endpoint = authMode === 'unclaimed' ? '/api/admin/claim' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Ошибка авторизации.');
        return;
      }
      setToken(data.token);
      setPassword('');
      setConfirmPassword('');
      setAuthMode('claimed');
    } catch {
      setAuthError('Сетевая ошибка при входе.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleBookingUpdate = async (id: string, patch: { status?: BookingStatus; adminNote?: string }) => {
    if (!token) return;
    const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = (await res.json()) as { booking: BookingItem };
      setBookings((prev) => prev.map((b) => (b.id === id ? data.booking : b)));
    }
  };

  const handleBookingDelete = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleExportCsv = () => {
    const header = ['ID', 'Имя', 'Телефон', 'Услуга', 'Врач', 'Дата визита', 'Статус', 'Комментарий', 'Заметка'];
    const rows = bookings.map((b) =>
      [
        b.id,
        b.name,
        b.phone,
        b.service,
        b.doctor,
        b.preferredDate,
        STATUS_LABELS[b.status],
        b.comment,
        b.adminNote,
      ]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = '\uFEFF' + [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pervaya-detskaya-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveContent = async () => {
    if (!token) return;
    setSavingMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draftContent),
      });
      const data = (await res.json()) as { content?: ClinicContent; error?: string };
      if (!res.ok || !data.content) {
        setErrorMsg(data.error || 'Не удалось сохранить изменения.');
        return;
      }
      onContentSaved(data.content);
      setSavingMsg('Изменения сохранены и опубликованы на сайте.');
    } catch {
      setErrorMsg('Ошибка сети при сохранении контента.');
    }
  };

  const handleResetContent = async () => {
    if (!token) return;
    const res = await fetch('/api/content/reset', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as { content: ClinicContent };
      setDraftContent(data.content);
      onContentSaved(data.content);
      setSavingMsg('Контент сброшен к исходным настройкам.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-7 sm:p-8 shadow-sm">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#050914] mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться на сайт клиники</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] text-[#FDE047] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-[#132347]">
                Панель администратора
              </h1>
              <p className="text-xs text-slate-500">
                {authMode === 'unclaimed'
                  ? 'Первичная настройка доступа'
                  : 'Управление заявками и контентом «Первая Детская Стоматология»'}
              </p>
            </div>
          </div>

          {authMode === 'loading' ? (
            <p className="text-sm text-slate-500 py-6">Проверка статуса доступа...</p>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-4 mt-6">
              {authMode === 'unclaimed' && (
                <p className="text-xs text-slate-600 leading-relaxed bg-sky-50 border border-sky-200 rounded-lg p-3">
                  Задайте пароль администратора для первого входа. После настройки он сохранится в защищенном виде на сервере.
                </p>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {authMode === 'unclaimed' ? 'Новый пароль (минимум 8 символов)' : 'Пароль администратора'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-slate-300 text-sm text-[#132347] focus:outline-none focus:border-[#1D4ED8]"
                  placeholder="••••••••"
                />
              </div>

              {authMode === 'unclaimed' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Подтвердите пароль
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-lg border border-slate-300 text-sm text-[#132347] focus:outline-none focus:border-[#1D4ED8]"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {authError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-800">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full min-h-[46px] rounded-xl bg-[#1D4ED8] text-white text-sm font-bold hover:bg-[#1E40AF] transition-colors cursor-pointer"
              >
                {authSubmitting
                  ? 'Проверка...'
                  : authMode === 'unclaimed'
                  ? 'Создать пароль и войти'
                  : 'Войти в панель'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const q = bookingSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q) ||
      b.service.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const addService = () => {
    const newSrv: ServiceItem = {
      id: `srv-${Date.now().toString(36)}`,
      title: 'Новая детская услуга',
      category: 'Профилактика',
      price: 'от 4 900 ₽',
      duration: '40 мин',
      shortDesc: 'Бережный приём ребёнка с мультиками и подарком.',
      fullDesc: 'Подробное описание щадящего детского протокола и адаптации.',
      outcome: 'Здоровые зубки и улыбка без страха',
      beforeImage: '/src/assets/images/kids_clinic_playroom_1795779157263.jpg',
      afterImage: '/src/assets/images/kids_happy_smile_1795779157603.jpg',
    };
    setDraftContent((prev) => ({ ...prev, services: [...prev.services, newSrv] }));
  };

  const addDoctor = () => {
    const newDoc: DoctorItem = {
      id: `doc-${Date.now().toString(36)}`,
      name: 'Новый детский стоматолог',
      role: 'Детский врач-стоматолог',
      experience: '9 лет опыта с детьми',
      education: 'МГМСУ им. А.И. Евдокимова',
      bio: 'Специалист по бережной адаптации малышей и лечению молочных зубов без слёз.',
      image: '/src/assets/images/slavic_doctor_maria_1795780362803.jpg',
      specialtyTag: 'Терапия',
    };
    setDraftContent((prev) => ({ ...prev, doctors: [...prev.doctors, newDoc] }));
  };

  return (
    <div className="min-h-screen bg-sky-50/40 text-[#132347]">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 min-h-[40px] px-3 rounded-lg border border-slate-200 text-xs font-semibold text-[#050914] hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>На сайт</span>
          </button>
          <span className="font-display text-lg sm:text-xl font-bold">
            {draftContent.settings.name} · CRM и Контент
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'bookings' && (
            <button
              type="button"
              onClick={handleSaveContent}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-xl bg-[#1D4ED8] text-white text-xs font-bold hover:bg-[#1E40AF] cursor-pointer whitespace-nowrap"
            >
              <Save className="w-4 h-4 text-[#FDE047]" />
              <span>Сохранить сайт</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setToken(null)}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg text-xs font-semibold text-slate-500 hover:text-[#050914] cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg overflow-x-auto no-scrollbar mb-6">
          {[
            { id: 'bookings', label: `Заявки (${bookings.length})` },
            { id: 'services', label: `Услуги (${draftContent.services.length})` },
            { id: 'doctors', label: `Врачи (${draftContent.doctors.length})` },
            { id: 'cases', label: 'До / После и Отзывы' },
            { id: 'settings', label: 'Настройки клиники' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as AdminTab);
                setSavingMsg('');
                setErrorMsg('');
              }}
              className={`px-4 py-2 min-h-[40px] rounded-md text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id ? 'bg-white text-[#050914] shadow-sm' : 'text-slate-600 hover:text-[#050914]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {savingMsg && (
          <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
            {savingMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {errorMsg}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Поиск по имени, телефону, услуге..."
                  className="min-h-[42px] px-3.5 rounded-lg border border-slate-300 bg-white text-sm w-full sm:w-72"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | BookingStatus)}
                  className="min-h-[42px] px-3 rounded-lg border border-slate-300 bg-white text-sm"
                >
                  <option value="all">Все статусы</option>
                  <option value="new">Новые</option>
                  <option value="confirmed">Подтвержденные</option>
                  <option value="completed">Завершенные</option>
                  <option value="cancelled">Отмененные</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-lg border border-slate-300 bg-white text-xs font-semibold hover:border-[#050914] cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#0D9488]" />
                <span>Экспорт CSV</span>
              </button>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Заявок по заданным фильтрам пока нет.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
                  >
                    <div className="lg:col-span-4 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={`font-semibold ${STATUS_COLORS[item.status]}`}>
                          {STATUS_LABELS[item.status]}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {new Date(item.createdAt).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-[#050914]">{item.name}</h3>
                      <p className="text-sm font-semibold text-[#0D9488] tabular-nums">{item.phone}</p>
                    </div>

                    <div className="lg:col-span-4 space-y-1 text-xs sm:text-sm text-slate-600">
                      <p><span className="text-slate-400">Услуга:</span> {item.service}</p>
                      <p><span className="text-slate-400">Врач:</span> {item.doctor}</p>
                      {item.preferredDate && (
                        <p className="tabular-nums">
                          <span className="text-slate-400">Дата:</span> {item.preferredDate}
                        </p>
                      )}
                      {item.comment && (
                        <p className="text-xs text-slate-500 pt-1">«{item.comment}»</p>
                      )}
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleBookingUpdate(item.id, { status: e.target.value as BookingStatus })
                          }
                          className="flex-1 min-h-[40px] px-3 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold"
                        >
                          <option value="new">Новая</option>
                          <option value="confirmed">Подтверждена</option>
                          <option value="completed">Завершена</option>
                          <option value="cancelled">Отменена</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleBookingDelete(item.id)}
                          className="min-w-[40px] min-h-[40px] rounded-lg border border-slate-200 text-slate-500 hover:text-red-700 hover:border-red-200 flex items-center justify-center cursor-pointer"
                          aria-label="Удалить заявку"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        key={`${item.id}-${item.adminNote}`}
                        type="text"
                        defaultValue={item.adminNote}
                        onBlur={(e) => handleBookingUpdate(item.id, { adminNote: e.target.value })}
                        placeholder="Заметка координатора (сохраняется при потере фокуса)"
                        className="w-full min-h-[38px] px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Редактируйте направления, цены и описания услуг.</p>
              <button
                type="button"
                onClick={addService}
                className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-lg border border-[#050914] text-xs font-semibold hover:bg-[#050914] hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить услугу</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftContent.services.map((srv, idx) => (
                <div key={srv.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#0D9488]">Услуга #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftContent((prev) => ({
                          ...prev,
                          services: prev.services.filter((s) => s.id !== srv.id),
                        }))
                      }
                      className="text-xs text-red-700 hover:underline cursor-pointer"
                    >
                      Удалить
                    </button>
                  </div>
                  <input
                    type="text"
                    value={srv.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftContent((prev) => ({
                        ...prev,
                        services: prev.services.map((s) => (s.id === srv.id ? { ...s, title: val } : s)),
                      }));
                    }}
                    className="w-full min-h-[40px] px-3 rounded-lg border border-slate-300 text-sm font-medium"
                    placeholder="Название услуги"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={srv.category}
                      onChange={(e) => {
                        const val = e.target.value as ServiceCategory;
                        setDraftContent((prev) => ({
                          ...prev,
                          services: prev.services.map((s) => (s.id === srv.id ? { ...s, category: val } : s)),
                        }));
                      }}
                      className="min-h-[38px] px-2 rounded-lg border border-slate-300 text-xs"
                    >
                      <option value="Профилактика">Профилактика</option>
                      <option value="Лечение">Лечение</option>
                      <option value="Прикус">Прикус</option>
                      <option value="Во сне">Во сне</option>
                    </select>
                    <input
                      type="text"
                      value={srv.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftContent((prev) => ({
                          ...prev,
                          services: prev.services.map((s) => (s.id === srv.id ? { ...s, price: val } : s)),
                        }));
                      }}
                      className="min-h-[38px] px-3 rounded-lg border border-slate-300 text-xs tabular-nums"
                      placeholder="Цена"
                    />
                    <input
                      type="text"
                      value={srv.duration}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftContent((prev) => ({
                          ...prev,
                          services: prev.services.map((s) => (s.id === srv.id ? { ...s, duration: val } : s)),
                        }));
                      }}
                      className="min-h-[38px] px-3 rounded-lg border border-slate-300 text-xs"
                      placeholder="Срок"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={srv.shortDesc}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftContent((prev) => ({
                        ...prev,
                        services: prev.services.map((s) => (s.id === srv.id ? { ...s, shortDesc: val } : s)),
                      }));
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    placeholder="Краткое описание"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCTORS TAB */}
        {activeTab === 'doctors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Управление профилями врачей в слайдере.</p>
              <button
                type="button"
                onClick={addDoctor}
                className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-lg border border-[#050914] text-xs font-semibold hover:bg-[#050914] hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить врача</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftContent.doctors.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0D9488]">{doc.specialtyTag}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftContent((prev) => ({
                          ...prev,
                          doctors: prev.doctors.filter((d) => d.id !== doc.id),
                        }))
                      }
                      className="text-xs text-red-700 hover:underline cursor-pointer"
                    >
                      Удалить
                    </button>
                  </div>
                  <input
                    type="text"
                    value={doc.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftContent((prev) => ({
                        ...prev,
                        doctors: prev.doctors.map((d) => (d.id === doc.id ? { ...d, name: val } : d)),
                      }));
                    }}
                    className="w-full min-h-[40px] px-3 rounded-lg border border-slate-300 text-sm font-medium"
                    placeholder="ФИО врача"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={doc.role}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftContent((prev) => ({
                          ...prev,
                          doctors: prev.doctors.map((d) => (d.id === doc.id ? { ...d, role: val } : d)),
                        }));
                      }}
                      className="min-h-[38px] px-3 rounded-lg border border-slate-300 text-xs"
                      placeholder="Должность"
                    />
                    <input
                      type="text"
                      value={doc.experience}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftContent((prev) => ({
                          ...prev,
                          doctors: prev.doctors.map((d) => (d.id === doc.id ? { ...d, experience: val } : d)),
                        }));
                      }}
                      className="min-h-[38px] px-3 rounded-lg border border-slate-300 text-xs"
                      placeholder="Опыт"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={doc.bio}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftContent((prev) => ({
                        ...prev,
                        doctors: prev.doctors.map((d) => (d.id === doc.id ? { ...d, bio: val } : d)),
                      }));
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    placeholder="Специализация"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CASES & REVIEWS TAB */}
        {activeTab === 'cases' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold">Кейсы До и После</h2>
              {draftContent.cases.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <input
                    type="text"
                    value={c.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftContent((prev) => ({
                        ...prev,
                        cases: prev.cases.map((item) => (item.id === c.id ? { ...item, title: val } : item)),
                      }));
                    }}
                    className="w-full min-h-[40px] px-3 rounded-lg border border-slate-300 text-sm font-medium"
                  />
                  <textarea
                    rows={3}
                    value={c.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftContent((prev) => ({
                        ...prev,
                        cases: prev.cases.map((item) =>
                          item.id === c.id ? { ...item, description: val } : item
                        ),
                      }));
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold">Отзывы пациентов</h2>
              {draftContent.reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={r.patientName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftContent((prev) => ({
                          ...prev,
                          reviews: prev.reviews.map((item) =>
                            item.id === r.id ? { ...item, patientName: val } : item
                          ),
                        }));
                      }}
                      className="min-h-[38px] px-3 rounded-lg border border-slate-300 text-xs font-medium"
                    />
                    <input
                      type="text"
                      value={r.service}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftContent((prev) => ({
                          ...prev,
                          reviews: prev.reviews.map((item) =>
                            item.id === r.id ? { ...item, service: val } : item
                          ),
                        }));
                      }}
                      className="min-h-[38px] px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={r.outcomeText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftContent((prev) => ({
                        ...prev,
                        reviews: prev.reviews.map((item) =>
                          item.id === r.id ? { ...item, outcomeText: val } : item
                        ),
                      }));
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Название клиники</label>
                <input
                  type="text"
                  value={draftContent.settings.name}
                  onChange={(e) =>
                    setDraftContent((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, name: e.target.value },
                    }))
                  }
                  className="w-full min-h-[42px] px-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Телефон</label>
                <input
                  type="text"
                  value={draftContent.settings.phone}
                  onChange={(e) =>
                    setDraftContent((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, phone: e.target.value },
                    }))
                  }
                  className="w-full min-h-[42px] px-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Адрес</label>
              <input
                type="text"
                value={draftContent.settings.address}
                onChange={(e) =>
                  setDraftContent((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, address: e.target.value },
                  }))
                }
                className="w-full min-h-[42px] px-3 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Заголовок первого экрана (Hero H1)</label>
              <input
                type="text"
                value={draftContent.settings.heroTitle}
                onChange={(e) =>
                  setDraftContent((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, heroTitle: e.target.value },
                  }))
                }
                className="w-full min-h-[42px] px-3 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Подзаголовок первого экрана</label>
              <textarea
                rows={3}
                value={draftContent.settings.heroSubtitle}
                onChange={(e) =>
                  setDraftContent((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, heroSubtitle: e.target.value },
                  }))
                }
                className="w-full p-3 rounded-lg border border-slate-300 text-sm"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetContent}
                className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:text-[#050914] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Сбросить к исходному контенту</span>
              </button>

              <button
                type="button"
                onClick={handleSaveContent}
                className="inline-flex items-center gap-2 min-h-[42px] px-6 rounded-xl bg-[#1D4ED8] text-white text-sm font-bold hover:bg-[#1E40AF] cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#FDE047]" />
                <span>Сохранить настройки</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
