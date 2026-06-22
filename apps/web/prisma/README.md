# Prisma Workflow

## Desarrollo

Luego de modificar `schema.prisma`:

```bash
pnpm db:migrate:dev
```

Esto:

- genera una nueva migración
- actualiza la base local
- regenera Prisma Client

Las migraciones deben ser commiteadas.

---

## Generar Prisma Client

```bash
pnpm db:generate
```

Debe ejecutarse luego de actualizar dependencias o modificar el schema.

---

## Seed

```bash
pnpm db:seed
```

Se utiliza únicamente para datos iniciales del sistema.

No debe ejecutarse automáticamente en cada deploy.

---

## Deploy

Antes de desplegar una versión que contiene nuevas migraciones:

```bash
pnpm db:migrate:deploy
```

Luego:

```bash
pnpm build
```

---

## Producción

No utilizar:

```bash
prisma migrate dev
prisma db push
prisma studio
```

en ambiente productivo.

Para producción utilizar únicamente:

```bash
prisma generate
prisma migrate deploy
```
