# Bijouterie Catalog

Учебный проект: каталог бижутерии, собранный так, чтобы пройти полный цикл
**код → тесты → CI/CD → деплой**. Стек выбран «минимально достаточный»:
один репозиторий, один деплой, без зоопарка сервисов.

## Стек

| Слой | Технология |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS |
| Backend | Next.js Route Handlers (`app/api/*`), Zod |
| БД | PostgreSQL + Prisma ORM |
| Тесты | Vitest (unit), Playwright (e2e) |
| CI/CD | GitHub Actions |
| Деплой | Vercel (бесплатный тариф) |

## Быстрый старт

```bash
npm install
cp .env.example .env       # Windows: copy .env.example .env
```

### Вариант A: база локально через Docker

```bash
docker compose up -d
npx prisma db push
npx prisma db seed
npm run dev
```

### Вариант B: база в Supabase (бесплатно, Docker не нужен)

> ⚠️ Neon не подходит, если вы в РФ: Cloudflare отдаёт 403 на всех его доменах.
> Supabase работает с любым PostgreSQL-клиентом, код проекта менять не нужно.

1. Зарегистрируйтесь на [supabase.com](https://supabase.com) (Free tier: 500 MB, 2 проекта).
2. **New project** → имя `bijouterie`, пароль БД (сохраните!), регион ближе к вам.
3. Дождитесь провижининга (~2 минуты) → **Connect** → вкладка **Session pooler**
   → скопируйте URI вида:
   ```
   postgresql://postgres.abcdefgh:ПАРОЛЬ@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
4. Примените схему и данные одной командой:

```powershell
.\scripts\init-db.ps1 -DatabaseUrl "postgresql://..."
```

Скрипт сам: создаст `.env` из `.env.example`, запишет `DATABASE_URL`,
выполнит `prisma generate` → `db push` → `db seed` и проверит результат.

5. Запустите приложение:

```powershell
npm run dev
```

Проверка состояния БД в любой момент: `npm run db:check`.

**Про подключения Supabase:**

| Тип | Порт | Когда использовать |
|---|---|---|
| Session pooler | 5432 | **наш случай** — миграции + приложение |
| Transaction pooler | 6543 | serverless-функции с большим RPS (`?pgbouncer=true`) |
| Direct | 5432 | только IPv6, для новых проектов часто недоступен |

Если в пароле есть `@ : / ? #`, закодируйте его через URL-encode
(`@` → `%40`) или задайте пароль только из букв и цифр.

> 💡 Бесплатный проект Supabase засыпает после 7 дней простоя.
> Первый запрос после паузы может занять несколько секунд.

Приложение: http://localhost:3000
Prisma Studio: `npm run db:studio`

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | дев-сервер с HMR |
| `npm run build` | production-сборка |
| `npm run lint` | ESLint |
| `npm run typecheck` | проверка типов без сборки |
| `npm run test:unit` | unit-тесты (Vitest) |
| `npm run test:e2e` | e2e-тесты (Playwright, поднимает приложение сам) |
| `npm run db:push` | синхронизировать схему с БД (только dev) |
| `npm run db:migrate` | создать файл миграции (для продакшена) |
| `npm run db:seed` | залить тестовые данные |
| `npm run db:check` | проверить, что БД доступна и данные на месте |
| `npm run db:reset` | пересоздать БД + миграции + seed |

## Структура

```
app/
  api/health/route.ts          # health-check для мониторинга
  api/products/route.ts        # GET (список+фильтры), POST (создание)
  api/products/[id]/route.ts   # GET / PATCH / DELETE
  products/page.tsx            # каталог (server component)
  admin/page.tsx               # админка (форма)
components/
  ProductForm.tsx              # клиентская форма -> POST /api/products
lib/
  prisma.ts                    # singleton Prisma Client
  validation.ts                # Zod-схемы (общие для API и тестов)
  format.ts                    # деньги в копейках, форматирование
prisma/
  schema.prisma                # структура БД
  seed.ts                      # 4 категории + 16 товаров
tests/
  unit/validation.test.ts      # unit: валидация и денежная математика
  e2e/catalog.spec.ts          # smoke: каталог, health, ошибки валидации
```

## Пайплайн CI

Файл `.github/workflows/ci.yml`. На каждый push и PR:

```
npm ci → prisma generate → db push + seed (Postgres в services)
      → lint → typecheck → unit → build → e2e → артефакты при падении
```

Затем job `deploy` (только для `main`) — заглушка под Vercel.

## Подключение Vercel (шаг 3 обучения)

1. Зарегистрируйтесь на [vercel.com](https://vercel.com) через GitHub.
2. **Add New → Project → Import** репозиторий `bijouterie-catalog`.
3. Environment Variables: `DATABASE_URL` (строка из Neon, режим pooling).
4. Build Command оставьте по умолчанию, но добавьте `prisma generate`
   (см. `package.json` → при необходимости `postinstall`).
5. Deploy. После деплоя откройте `/api/health` — должно быть `{"status":"ok"}`.

> Миграции на проде: `npx prisma migrate deploy` в отдельном job или
> в build-команде на Vercel (`prisma migrate deploy && next build`).

## Правила работы с секретами

- `.env` в `.gitignore` — **никогда** не коммитится.
- В репозитории только `.env.example` с пустыми значениями.
- В GitHub Actions — **Settings → Secrets and variables → Actions**.
- Если секрет случайно попал в коммит: отозвать ключ, затем чистить историю.

## Что делать дальше

- [ ] Добавить авторизацию и роль `admin` (NextAuth или Supabase Auth)
- [ ] Загрузка изображений в Cloudinary
- [ ] Тест на гонку остатков при оформлении заказа
- [ ] Sentry + UptimeRobot на `/api/health`
- [ ] Branch protection: PR + зелёный CI обязательны для `main`
- [ ] k6-нагрузочный тест каталога
