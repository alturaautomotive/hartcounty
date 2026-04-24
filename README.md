# Hart County Animal Rescue

A Next.js 15 App Router application for Hart County animal rescue and pet adoption, built with TypeScript, Tailwind CSS, and Prisma with SQLite.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma ORM
- **Validation**: Zod
- **Forms**: React Hook Form

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

### 3. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed the database

```bash
npm run prisma:seed
```

This seeds 10 sample pets (parsed from hardcoded CSV data via PapaParse) and a default admin user (`admin@hartcounty.org` / `admin123`).

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
src/
  app/          # Next.js App Router pages and layouts
  lib/
    prisma.ts   # Singleton Prisma client
    actions.ts  # Server actions (e.g., createBooking)
  generated/    # Prisma generated client
prisma/
  schema.prisma # Database schema (Pet, BookingRequest, Donation, AdminUser)
  seed.ts       # Database seed script
```

## Database Models

- **Pet** - Adoptable animals with breed, age, status, etc.
- **BookingRequest** - Visit/adoption booking requests linked to pets
- **Donation** - Monetary donations (one-time or recurring)
- **AdminUser** - Admin accounts with hashed passwords

## CSV Mapping (PET-V2-TEST-Sheet1.csv -> Pet model)

| CSV Column     | Pet Field     | Notes                          |
| -------------- | ------------- | ------------------------------ |
| title          | name, slug    | slug generated from name       |
| availability   | status        | "Adopted" -> "adopted", else "available" |
| breed          | breed         |                                |
| age            | ageCategory   |                                |
| sex            | sex           |                                |
| size           | size          |                                |
| weight         | weight        |                                |
| color          | color         |                                |
| description    | description   |                                |
| price          | price, adoptionFee |                           |
| image          | imageUrl      |                                |

## Tailwind Theme

The project uses a rescue-themed color palette defined in `globals.css`:

- **Primary**: Blues (`#2563eb`) for CTAs and links
- **Background**: Warm stone (`#fafaf9`) for a welcoming feel
- **Success**: Green (`#10b981`) for availability badges
- **Accent**: Amber (`#f59e0b`) for highlights
- **Font**: Inter (sans-serif) for readability
