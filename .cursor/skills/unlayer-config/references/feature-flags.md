# Unlayer Feature Flags Reference

All available flags for `features` in `unlayer.init()`:

```javascript
features: {
  // --- CORE ---
  audit: true,
  preview: true, // or object
  blocks: true,
  undoRedo: true, // or { enabled: true, autoSelect: true, autoFocus: true }
  stockImages: true, // or { enabled: true, safeSearch: true, defaultSearchTerm: 'business' }
  userUploads: true, // or { enabled: true, search: true }
  preheaderText: true,
  headersAndFooters: false,
  sendTestEmail: false,

  // --- TEXT EDITOR ---
  textEditor: {
    spellChecker: true,
    tables: false,
    cleanPaste: "confirm", // true | false | "basic" | "confirm"
    emojis: true,
    textDirection: true,
    inlineFontControls: true,
    customButtons: [],
  },

  // --- AI ---
  ai: true, // or object

  // --- IMAGE EDITOR ---
  imageEditor: true, // or { enabled: true, tools: { resize: true } }

  // --- COLOR PICKER ---
  colorPicker: {
    colors: ["#FF0000"], // string[] or ColorGroup[]
    limit: 50,
    recentColors: true,
  },

  // --- COLLABORATION ---
  collaboration: false,

  // --- LEGACY ---
  legacy: {
    disableHoverButtonColors: false,
  },
}
```

Notes:

- Prefer shared config modules in this repo over page-local flag drift.
- Keep paid or entitlement-backed features documented without committing secrets or tenant-specific settings.
