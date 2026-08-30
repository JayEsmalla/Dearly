# Dearly

Dearly is a digital gifting platform for creating thoughtful, personalized gifts that recipients can unwrap in a browser.

## Current foundation

The current foundation includes:

- A responsive product landing page
- Occasion and gift-type selection
- A structured personalization editor with live preview
- Four visual themes
- An interactive wrap-and-unveil recipient preview
- Validated server-side gift publishing
- Private recipient links at `/g/{publicId}`
- A Supabase schema with locked-down client roles and rollback coverage

Authentication, gift management, scheduling controls, delivery, and payments remain future phases.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Connect gift publishing

1. Copy `.env.example` to `.env.local` and add the Supabase project URL and secret key.
2. Apply `supabase/migrations/202608310001_create_gifts.sql` to the Supabase project.
3. Restart the development server and publish a gift from the personalization editor.

The secret key is server-only. Never expose it through a `NEXT_PUBLIC_` variable or commit `.env.local`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```
