# KAS Admin V16.1 — Frontend Language Observer Fix

- Keeps the V16 EN/VI language dropdown and placement.
- Fixes the language `MutationObserver` so it disconnects while applying translations and cannot react to its own text-node changes indefinitely.
- No hotel content, room data, uploads, or image files are changed.
- `uploads/` remains excluded from the package.
