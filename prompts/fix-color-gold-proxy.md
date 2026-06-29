# Fix: replace --color-gold proxy with var(--color-primary) direct

## Проблема
`:root { --color-gold: var(--color-primary) }` — proxy chain не работает надёжно
когда `--color-primary` определён только на `body` (inline style), а не на `:root`.
Элементы типа `.section-label` не получают медный цвет.

На Vercel (старый код) было `--color-gold: #C96030` — хардкод, всегда работал.
На localhost (новый код) — proxy через body сломан.

## Решение
Убрать `--color-gold` alias. Заменить все `var(--color-gold)` → `var(--color-primary)` напрямую.

## Шаги

### 1. В globals.css удали из :root эти 3 строки:
```
--color-gold:           var(--color-primary);
--color-gold-dark:      var(--color-primary-dark);
--color-gold-light:     var(--color-primary-light);
```

### 2. Глобальная замена в globals.css:
```
var(--color-gold)       →  var(--color-primary)
var(--color-gold-dark)  →  var(--color-primary-dark)
var(--color-gold-light) →  var(--color-primary-light)
```

### 3. Проверь что ничего не осталось:
```bash
grep -n "color-gold" src/app/globals.css
```
Должно быть пусто.

### 4. TypeScript check:
```bash
npx tsc --noEmit
```
Ожидаем: 0 errors.

### 5. Коммит + push:
```bash
git add src/app/globals.css
git commit -m "fix: replace --color-gold proxy with direct var(--color-primary)"
git push origin main
git push vendshop-labs main
```
