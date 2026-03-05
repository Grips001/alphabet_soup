---
description: Avoid browser-reserved keyboard shortcuts in game controls
globs: src/game/**/*.ts
---

# Browser Key Restrictions

Do NOT bind these keys as game controls — they conflict with browser shortcuts:

- F1-F12 (help, devtools, find, address bar, etc.)
- Ctrl+any, Alt+any, Meta+any
- Tab, Escape (unless explicitly needed with preventDefault)
- Backspace (navigates back in some browsers)

Safe keys for game use:
- Letter keys (WASD already used for camera)
- Number keys (1-9 for tool selection)
- Backtick (`` ` ``) — used for debug overlay
- Space, Shift (modifiers for placement)
- Q, E, R, T, etc. for tool shortcuts
- Delete key for demolish

Always call `preventDefault()` on game-bound keys that might trigger browser behavior (e.g., space scrolls page).
