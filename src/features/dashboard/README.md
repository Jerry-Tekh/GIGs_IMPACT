# Dashboard Feature Structure

This folder contains the shared dashboard builder for all user roles.

## Layout
- `components/Layout.jsx` — unified dashboard shell used by admin, author, and reader.
- `components/Sidebar.jsx` — role-aware navigation sidebar.
- `components/Topbar.jsx` — dashboard header and logout controls.
- `components/DashboardSettingsPanel.jsx` — shared user settings panel.

## Config
- `config/navigation.js` — centralized route/navigation definitions for each role.

## Pages
- `pages/admin/` — admin-specific workspace pages.
- `pages/author/` — author-specific workspace pages.
- `pages/reader/` — reader-specific workspace pages.

## Notes
- Routes in `src/App.jsx` now load dashboard pages from `src/features/dashboard/pages/...`.
- Shared utilities are imported from `src/utils` using relative paths.
- Legacy empty `src/pages/Admin` and `src/pages/Author` folders were removed.
