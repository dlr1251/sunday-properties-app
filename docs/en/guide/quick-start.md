# Quick Start

Quick setup guide to get started with Sunday Properties.

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/sunday-properties-app.git
cd sunday-properties-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

## Configuration

1. **Supabase**: Create a project at [supabase.com](https://supabase.com)
2. **Environment variables**: Configure the following variables in `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY` (optional)

## Run in development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Next Steps

- [Concepts](concepts) — Understand the domain model
- [Architecture](architecture) — Explore the technical stack
- [Processes](../processes/publish-property) — Learn the workflows

---

[Back to index](../index)
