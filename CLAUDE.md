# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # Install deps + generate Prisma client + run migrations
npm run dev            # Dev server with Turbopack at http://localhost:3000
npm run build          # Production build
npm run lint           # ESLint (extends next config)
npm test               # Run all tests with vitest
npx vitest run src/components/chat/__tests__/MessageList.test.tsx  # Run single test
npx prisma generate    # Regenerate Prisma client after schema changes
npx prisma migrate dev # Create/apply migrations after schema changes
npm run db:reset       # Reset database (destructive)
```

All `dev`, `build`, and `start` scripts require `NODE_OPTIONS='--require ./node-compat.cjs'` (already configured in package.json) for Node.js 25+ compatibility.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat, Claude generates them via tool calls, and a live preview renders the result in an iframe.

### Three-Panel Layout
- **Left panel (35%):** Chat interface (`src/components/chat/`)
- **Right panel (65%):** Tabbed view with Preview (`src/components/preview/PreviewFrame.tsx`) and Code Editor (`src/components/editor/CodeEditor.tsx` using Monaco)

### AI Generation Flow
1. User sends message → `/api/chat` route (`src/app/api/chat/route.ts`)
2. Vercel AI SDK's `streamText` calls Claude with system prompt from `src/lib/prompts/generation.tsx`
3. Claude uses two tools to manipulate the virtual file system:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create/edit/view files
   - `file_manager` (`src/lib/tools/file-manager.ts`) — rename/delete files
4. Tool results update `FileSystemContext`, which triggers preview refresh
5. Max 40 tool steps per request (4 for mock provider)

### Virtual File System
- In-memory implementation in `src/lib/file-system.ts` (`VirtualFileSystem` class)
- No disk writes — files exist only in memory and are serialized to the database as JSON
- Generated components must have `/App.jsx` as the entry point
- Imports between generated files use `@/` alias (e.g., `@/components/Foo`)

### Preview Rendering
- `src/lib/transform/jsx-transformer.ts` uses Babel standalone to transpile JSX client-side
- Import maps resolve dependencies from esm.sh CDN
- Preview renders in a sandboxed iframe

### Auth & Data
- JWT-based auth with `jose`, stored in httpOnly cookies (7-day expiry)
- Server actions in `src/actions/` handle auth and project CRUD
- Auth logic in `src/lib/auth.ts` (server-only)
- Prisma with SQLite (`prisma/schema.prisma`); client generated to `src/generated/prisma`
- Two models: `User` and `Project` (projects store serialized messages + file system)

### State Management
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — chat messages and submission state
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — virtual FS and selected file

### Mock Provider
When `ANTHROPIC_API_KEY` is not set, `src/lib/provider.ts` falls back to a mock that returns static component code — useful for development without API access.

## Key Conventions
- **Path alias:** `@/*` maps to `./src/*`
- **UI components:** shadcn/ui in `src/components/ui/` (Radix UI primitives, "new-york" style)
- **Styling:** Tailwind CSS v4 (import-based config in `globals.css`, not `tailwind.config.js`)
- **Testing:** Vitest + Testing Library with jsdom environment; test files in `__tests__/` directories
- **App Router:** Next.js 15 App Router with dynamic `[projectId]` routes
- **Comments:** Use comments sparingly. Only comment complex code.
- **Database schema:** Defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.
