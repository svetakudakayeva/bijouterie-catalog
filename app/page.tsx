import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Учебный проект</p>
        <h1 className="text-4xl font-semibold leading-tight">
          Каталог бижутерии с полным циклом разработки
        </h1>
        <p className="max-w-2xl text-black/70">
          Фронтенд и API на Next.js, база данных PostgreSQL через Prisma,
          CI/CD на GitHub Actions. Проект создан, чтобы пройти путь
          «код → тесты → пайплайн → деплой» целиком.
        </p>
        <div className="flex gap-3">
          <Link href="/products" className="btn">
            Открыть каталог
          </Link>
          <Link href="/admin" className="btn-outline">
            Добавить товар
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Frontend", text: "Next.js App Router, React 19, Tailwind CSS" },
          { title: "Backend", text: "Route Handlers, Zod-валидация, Prisma ORM" },
          { title: "CI/CD", text: "Линт, типы, unit, e2e, деплой на Vercel" },
        ].map((item) => (
          <div key={item.title} className="card">
            <h2 className="font-medium">{item.title}</h2>
            <p className="mt-1 text-sm text-black/60">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
