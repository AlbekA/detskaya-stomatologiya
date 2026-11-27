import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_CLINIC_CONTENT } from './src/data/defaultClinicData.ts';
import type { BookingItem, BookingStatus, ClinicContent } from './src/types/clinic.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.resolve(DATA_DIR, 'clinic-db.json');
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

interface AdminAuthRecord {
  salt: string;
  hash: string;
}

interface ClinicDatabase {
  content: ClinicContent;
  bookings: BookingItem[];
  adminAuth: AdminAuthRecord | null;
}

function createInitialBookings(): BookingItem[] {
  const now = Date.now();
  return [
    {
      id: 'bk-1001',
      name: 'Ольга (ребёнок Алиса, 5 лет)',
      phone: '+7 (916) 482-19-30',
      service: 'Первый визит-знакомство и адаптация',
      doctor: 'Мария Соколова',
      preferredDate: '2026-11-28',
      comment: 'Первый визит к зубной фее, хотим посмотреть мультики и познакомиться с врачом.',
      status: 'confirmed',
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      adminNote: 'Подготовить подарок с наклейками и диплом храбрости.',
    },
    {
      id: 'bk-1002',
      name: 'Антон (ребёнок Лёва, 7 лет)',
      phone: '+7 (925) 774-08-12',
      service: 'Яркие пластинки и детские элайнеры',
      doctor: 'Илья Воронцов',
      preferredDate: '2026-11-29',
      comment: 'Нужен 3D-скан для проверки прикуса перед школой.',
      status: 'new',
      createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
      adminNote: '',
    },
  ];
}

function readDatabase(): ClinicDatabase {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const initial: ClinicDatabase = {
      content: DEFAULT_CLINIC_CONTENT,
      bookings: createInitialBookings(),
      adminAuth: null,
    };
    writeDatabase(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ClinicDatabase>;
    return {
      content: parsed.content ?? DEFAULT_CLINIC_CONTENT,
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : createInitialBookings(),
      adminAuth: parsed.adminAuth ?? null,
    };
  } catch {
    const fallback: ClinicDatabase = {
      content: DEFAULT_CLINIC_CONTENT,
      bookings: createInitialBookings(),
      adminAuth: null,
    };
    writeDatabase(fallback);
    return fallback;
  }
}

function writeDatabase(db: ClinicDatabase): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tempPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tempPath, DB_PATH);
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function safeEqualText(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + 1000 * 60 * 60 * 12,
      nonce: crypto.randomBytes(8).toString('hex'),
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function sanitizeUrl(url: unknown, fallback: string): string {
  if (typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

function sanitizeText(value: unknown, maxLen: number, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLen);
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Требуется авторизация администратора.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!verifySessionToken(token)) {
    res.status(401).json({ error: 'Сессия истекла или недействительна.' });
    return;
  }
  next();
}

const aiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Public content endpoint
  app.get('/api/content', (_req, res) => {
    const db = readDatabase();
    res.json(db.content);
  });

  // Public Google Maps JS API key config endpoint (client browser key only)
  app.get('/api/maps-config', (_req, res) => {
    res.json({
      apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
    });
  });

  // Public booking submission
  app.post('/api/bookings', (req, res) => {
    const body = req.body as Record<string, unknown>;
    const name = sanitizeText(body.name, 100);
    const phone = sanitizeText(body.phone, 40);
    const service = sanitizeText(body.service, 140, 'Первичная 3D-консультация');
    const doctor = sanitizeText(body.doctor, 100, 'Любой профильный специалист');
    const preferredDate = sanitizeText(body.preferredDate, 30);
    const comment = sanitizeText(body.comment, 600);

    if (name.length < 2) {
      res.status(400).json({ error: 'Укажите корректное имя (не менее 2 символов).' });
      return;
    }
    const digitsCount = phone.replace(/\D/g, '').length;
    if (digitsCount < 10 || digitsCount > 15) {
      res.status(400).json({ error: 'Укажите корректный номер телефона.' });
      return;
    }

    const db = readDatabase();
    const newBooking: BookingItem = {
      id: `bk-${Date.now().toString(36)}`,
      name,
      phone,
      service,
      doctor,
      preferredDate,
      comment,
      status: 'new',
      createdAt: new Date().toISOString(),
      adminNote: '',
    };

    db.bookings.unshift(newBooking);
    writeDatabase(db);
    res.status(201).json({ ok: true, booking: newBooking });
  });

  // AI Concierge Chatbot endpoint (server-side Gemini)
  app.post('/api/chat', async (req, res) => {
    if (!process.env.GEMINI_API_KEY || !aiClient) {
      res.status(503).json({
        error: 'Ассистент временно недоступен: не задан ключ GEMINI_API_KEY в настройках проекта.',
      });
      return;
    }

    const body = req.body as {
      messages?: Array<{ role?: string; text?: string }>;
    };
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const cleaned = rawMessages
      .filter((m) => typeof m.text === 'string' && m.text.trim().length > 0)
      .slice(-12)
      .map((m) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.text!.trim().slice(0, 1500) }],
      }));

    if (cleaned.length === 0) {
      res.status(400).json({ error: 'Введите сообщение для консультации.' });
      return;
    }

    const db = readDatabase();
    const { settings, services, doctors } = db.content;
    const servicesText = services
      .map((s) => `- ${s.title} (${s.category}): ${s.price}, срок/длительность: ${s.duration}. ${s.shortDesc}`)
      .join('\n');
    const doctorsText = doctors
      .map((d) => `- ${d.name} — ${d.role} (${d.experience}). ${d.education}`)
      .join('\n');

    const systemInstruction = `Ты — тёплый, дружелюбный и заботливый помощник детской стоматологической клиники ${settings.name} (${settings.city}, ${settings.address}).
Часы работы: ${settings.hours}. Телефон: ${settings.phone}.
Наши главные особенности для детей и родителей: игровая зона с горкой, мультики на потолочном экране во время приёма, 3D-сканирование вместо слепков, сладкая гелевая «заморозка», маска с закисью азота (ЗАКС), бережное лечение во сне (Севоран) и подарки из волшебного сундучка после визита.

Услуги и ориентировочные цены:
${servicesText}

Детские врачи клиники:
${doctorsText}

Правила общения:
1. Отвечай на русском языке тепло, понятно и заботливо — успокаивай родителей, объясняй, как проходит адаптация ребёнка без слёз.
2. Помогай подобрать визит (адаптация, лечение молочных зубов, профгигиена, прикус, лечение во сне), называй актуальные цены из списка выше.
3. Не ставь окончательный диагноз дистанционно — бережно приглашай на первый визит-знакомство и предлагай оставить заявку на сайте или позвонить по номеру ${settings.phone}.
4. Отвечай структурированно и кратко (2–4 предложения).`;

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: cleaned,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Не удалось получить ответ от ассистента.' });
        return;
      }

      res.json({ reply });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка обращения к сервису консультации.';
      res.status(502).json({ error: message });
    }
  });

  // Admin auth status
  app.get('/api/admin/status', (_req, res) => {
    const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
    const db = readDatabase();
    if (envPasscode.length > 0) {
      res.json({ configured: true, mode: 'env' });
      return;
    }
    if (db.adminAuth && db.adminAuth.hash) {
      res.json({ configured: true, mode: 'claimed' });
      return;
    }
    res.json({ configured: false, mode: 'unclaimed' });
  });

  // First-run admin password claim (only when env ADMIN_PASSCODE is unset and no hash exists)
  app.post('/api/admin/claim', (req, res) => {
    const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
    if (envPasscode.length > 0) {
      res.status(403).json({ error: 'Доступ управляется через переменную окружения ADMIN_PASSCODE.' });
      return;
    }
    const db = readDatabase();
    if (db.adminAuth && db.adminAuth.hash) {
      res.status(409).json({ error: 'Пароль администратора уже настроен.' });
      return;
    }
    const password = typeof (req.body as { password?: unknown }).password === 'string'
      ? (req.body as { password: string }).password.trim()
      : '';
    if (password.length < 8) {
      res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов.' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    db.adminAuth = { salt, hash };
    writeDatabase(db);

    const token = createSessionToken();
    res.status(201).json({ token });
  });

  // Admin login
  app.post('/api/admin/login', (req, res) => {
    const password = typeof (req.body as { password?: unknown }).password === 'string'
      ? (req.body as { password: string }).password.trim()
      : '';
    if (!password) {
      res.status(400).json({ error: 'Введите пароль администратора.' });
      return;
    }

    const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
    if (envPasscode.length > 0) {
      if (!safeEqualText(password, envPasscode)) {
        res.status(401).json({ error: 'Неверный пароль администратора.' });
        return;
      }
      res.json({ token: createSessionToken() });
      return;
    }

    const db = readDatabase();
    if (!db.adminAuth) {
      res.status(400).json({ error: 'Пароль администратора еще не создан.' });
      return;
    }

    const attemptHash = hashPassword(password, db.adminAuth.salt);
    if (!safeEqualText(attemptHash, db.adminAuth.hash)) {
      res.status(401).json({ error: 'Неверный пароль администратора.' });
      return;
    }

    res.json({ token: createSessionToken() });
  });

  // Protected admin routes
  app.get('/api/bookings', requireAdmin, (_req, res) => {
    const db = readDatabase();
    res.json({ bookings: db.bookings });
  });

  app.patch('/api/bookings/:id', requireAdmin, (req, res) => {
    const id = req.params.id;
    const body = req.body as { status?: BookingStatus; adminNote?: string };
    const allowedStatuses: BookingStatus[] = ['new', 'confirmed', 'completed', 'cancelled'];
    const db = readDatabase();
    const target = db.bookings.find((b) => b.id === id);
    if (!target) {
      res.status(404).json({ error: 'Заявка не найдена.' });
      return;
    }
    if (body.status && allowedStatuses.includes(body.status)) {
      target.status = body.status;
    }
    if (typeof body.adminNote === 'string') {
      target.adminNote = sanitizeText(body.adminNote, 500);
    }
    writeDatabase(db);
    res.json({ booking: target });
  });

  app.delete('/api/bookings/:id', requireAdmin, (req, res) => {
    const id = req.params.id;
    const db = readDatabase();
    const next = db.bookings.filter((b) => b.id !== id);
    if (next.length === db.bookings.length) {
      res.status(404).json({ error: 'Заявка не найдена.' });
      return;
    }
    db.bookings = next;
    writeDatabase(db);
    res.json({ ok: true });
  });

  app.put('/api/content', requireAdmin, (req, res) => {
    const payload = req.body as Partial<ClinicContent>;
    if (!payload || !payload.settings || !Array.isArray(payload.services) || !Array.isArray(payload.doctors)) {
      res.status(400).json({ error: 'Некорректная структура контента.' });
      return;
    }

    const sanitized: ClinicContent = {
      settings: {
        name: sanitizeText(payload.settings.name, 80, DEFAULT_CLINIC_CONTENT.settings.name),
        city: sanitizeText(payload.settings.city, 80, DEFAULT_CLINIC_CONTENT.settings.city),
        address: sanitizeText(payload.settings.address, 200, DEFAULT_CLINIC_CONTENT.settings.address),
        phone: sanitizeText(payload.settings.phone, 40, DEFAULT_CLINIC_CONTENT.settings.phone),
        phoneHref: sanitizeText(payload.settings.phoneHref, 50, DEFAULT_CLINIC_CONTENT.settings.phoneHref),
        email: sanitizeText(payload.settings.email, 100, DEFAULT_CLINIC_CONTENT.settings.email),
        hours: sanitizeText(payload.settings.hours, 100, DEFAULT_CLINIC_CONTENT.settings.hours),
        license: sanitizeText(payload.settings.license, 140, DEFAULT_CLINIC_CONTENT.settings.license),
        heroTitle: sanitizeText(payload.settings.heroTitle, 180, DEFAULT_CLINIC_CONTENT.settings.heroTitle),
        heroSubtitle: sanitizeText(payload.settings.heroSubtitle, 450, DEFAULT_CLINIC_CONTENT.settings.heroSubtitle),
        aboutTitle: sanitizeText(payload.settings.aboutTitle, 180, DEFAULT_CLINIC_CONTENT.settings.aboutTitle),
        aboutText: sanitizeText(payload.settings.aboutText, 700, DEFAULT_CLINIC_CONTENT.settings.aboutText),
      },
      services: payload.services.slice(0, 20).map((s, idx) => ({
        id: sanitizeText(s.id, 60, `srv-${idx}`),
        title: sanitizeText(s.title, 120),
        category: s.category,
        price: sanitizeText(s.price, 50),
        duration: sanitizeText(s.duration, 50),
        shortDesc: sanitizeText(s.shortDesc, 240),
        fullDesc: sanitizeText(s.fullDesc, 600),
        outcome: sanitizeText(s.outcome, 200),
        beforeImage: sanitizeUrl(s.beforeImage, '/src/assets/images/kids_clinic_playroom_1795779157263.jpg'),
        afterImage: sanitizeUrl(s.afterImage, '/src/assets/images/kids_happy_smile_1795779157603.jpg'),
        featured: Boolean(s.featured),
      })),
      doctors: payload.doctors.slice(0, 20).map((d, idx) => ({
        id: sanitizeText(d.id, 60, `doc-${idx}`),
        name: sanitizeText(d.name, 100),
        role: sanitizeText(d.role, 120),
        experience: sanitizeText(d.experience, 50),
        education: sanitizeText(d.education, 180),
        bio: sanitizeText(d.bio, 500),
        image: sanitizeUrl(d.image, '/src/assets/images/slavic_doctor_maria_1795780362803.jpg'),
        specialtyTag: sanitizeText(d.specialtyTag, 60),
      })),
      cases: Array.isArray(payload.cases)
        ? payload.cases.slice(0, 15).map((c, idx) => ({
            id: sanitizeText(c.id, 60, `case-${idx}`),
            title: sanitizeText(c.title, 150),
            category: sanitizeText(c.category, 80),
            doctor: sanitizeText(c.doctor, 100),
            duration: sanitizeText(c.duration, 60),
            description: sanitizeText(c.description, 500),
            beforeImage: sanitizeUrl(c.beforeImage, '/src/assets/images/kids_clinic_playroom_1795779157263.jpg'),
            afterImage: sanitizeUrl(c.afterImage, '/src/assets/images/kids_happy_smile_1795779157603.jpg'),
          }))
        : DEFAULT_CLINIC_CONTENT.cases,
      reviews: Array.isArray(payload.reviews)
        ? payload.reviews.slice(0, 20).map((r, idx) => ({
            id: sanitizeText(r.id, 60, `rev-${idx}`),
            patientName: sanitizeText(r.patientName, 100),
            service: sanitizeText(r.service, 100),
            date: sanitizeText(r.date, 40),
            rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
            beforeNote: sanitizeText(r.beforeNote, 200),
            outcomeText: sanitizeText(r.outcomeText, 600),
          }))
        : DEFAULT_CLINIC_CONTENT.reviews,
    };

    const db = readDatabase();
    db.content = sanitized;
    writeDatabase(db);
    res.json({ ok: true, content: db.content });
  });

  app.post('/api/content/reset', requireAdmin, (_req, res) => {
    const db = readDatabase();
    db.content = DEFAULT_CLINIC_CONTENT;
    writeDatabase(db);
    res.json({ ok: true, content: db.content });
  });

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Первая Детская Стоматология server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
