# CSITABMC Admin Dashboard

Management and content administration portal for the CSIT Association of Butwal Multiple Campus (CSITABMC). Built with Next.js 16 (App Router), React 19, TanStack React Query, Tailwind CSS, and Axios.

---

## 📌 Backend Integration Roadmap & Audit

The comprehensive DRF backend integration audit and task checklist is documented in:
👉 **[INTEGRATION_ROADMAP.md](./INTEGRATION_ROADMAP.md)**

Use that document to work through the integration tasks sequentially:
- **Phase 1 (P0):** Critical contract parity & preventing data loss (`INT-01`, `INT-02`, `INT-04`, `INT-05`).
- **Phase 2 (P1):** Change password workflow and dedicated dashboard analytics API (`INT-03`, `INT-06`).
- **Phase 3 (P2):** Certificate template management, past papers search, and event tenure selector (`INT-07`, `INT-08`, `INT-09`).
- **Phase 4 (P3):** Mentor linking, notice slug uniqueness resilience, and test suite setup (`INT-10`, `INT-11`, `INT-12`).

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: v20+ recommended
- **Django Backend**: Running on `http://localhost:8000` (from `../cms-dashbaord`)

### 2. Configure Environment
Verify `.env`:
```env
NEXT_PUBLIC_URL=http://localhost:8000/api/v1
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## 📁 Repository Architecture

```
src/
├── api/             # Legacy mock constants (deprecated)
├── app/
│   ├── (auth)/      # Login & guest routes
│   └── (main)/      # Protected routes (dashboard, members, tenure, alumni, events, notices, certificates, past-papers, admins)
├── components/
│   ├── common/      # AuthGuard, GuestGuard, ProfileSheet, MarkdownEditor, Header, SideBar
│   └── ui/          # Radix-ui primitives & Tailwind components
├── hooks/           # TanStack React Query hooks (useAuth, useMembers, useEvents, etc.)
└── lib/
    ├── axios.js     # Axios client with automatic httpOnly cookie JWT refresh interceptor
    ├── Schema/      # Zod validation schemas
    └── store/       # Zustand persistent authentication store
```
