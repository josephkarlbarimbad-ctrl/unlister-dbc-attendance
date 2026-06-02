# Unlisted DBC Attendance System

A simple browser-based attendance tracker modeled after the sheet layout in your screenshot.

## Files

- `index.html` - Main attendance app UI.
- `styles.css` - Layout and styling for the sheet-style table.
- `script.js` - Attendance state management, date handling, and CSV export.

## How to use

1. Open `index.html` in a browser.
2. Click a cell to toggle present/absent/blank.
3. Add dates with the `Add Date` button.
4. Export data with `Export CSV`.

## Notes

- Attendance data is stored in the browser using `localStorage`.
- You can reset all attendance marks with `Reset Attendance`.
