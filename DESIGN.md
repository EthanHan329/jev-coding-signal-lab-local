# Jev Coding Signal Lab design system

## 1. Atmosphere & Identity

Preserve the existing compact, dark benchmark workspace. Teal identifies the
primary run action; neutral tables carry evidence. Longer scenarios remain
scannable through native disclosures rather than occupying an entire table row.

## 2. Color

Existing tokens: `--bg` #080b13, `--panel` #101522, `--panel2` #151b29,
`--line` #283044, `--ink` #f3f6fb, `--muted` #98a2b5, `--teal` #6ee7c7,
`--teal2` #28b99a, `--gold` #f5c451, `--red` #ff7b7b, `--blue` #87aefb,
`--purple` #b49bff. The app intentionally has one dark palette, including when
the operating system requests light mode. Model names reuse these accents.

## 3. Typography

Keep the current system sans stack and 15px / 1.5 body. Existing sizes are
12px metadata, 14px controls, 16px model headings, 19px metrics, and a
24–36px fluid page heading. New context text uses `--context-font-size: 14px`
with `--context-line-height: 1.6` and the inherited font; preserve line breaks
and wrap code and logs instead of introducing horizontal scrolling.

## 4. Spacing & Layout

Keep the centered 1320px content width and document scrolling. Existing
breakpoints are 980px and 620px. Model options and summaries use auto-fit
grids with a 220px minimum track and the existing 12px gap, so adding models
does not require fixed column counts. New tokens: `--space-2: 8px`,
`--space-3: 12px`, `--space-4: 16px`, `--focus-width: 2px`.

## 5. Components

- Model option: existing checkbox and two text lines inside a label. All
  models remain selectable; Jev 1.14 and Microsoft Decision-1 start checked.
  Selected state is a tonal wash and checkbox, with a neutral outline.
- Model summary: shared generated card with heading, metrics, empty state,
  and optional best-exact badge. Reuse the existing component for new models.
- Scenario disclosure: native `details` with task title in `summary`, metadata
  below it, and escaped full query text in a wrapping block. Closed/open and
  keyboard focus are browser-native; opening reveals exactly the API input.
- Dataset overview: muted paragraph above the table showing scenario count
  and word-count range. Word counts are measured, never presented as tokens.
- Tables: existing table-card owns horizontal overflow on narrow screens;
  scenario text wraps within its cell. Headers and inputs keep their labels.

## 6. Motion & Interaction

No new animations. Preserve native disclosure behavior, Run/Stop controls,
progress, tabs, and report downloads. Add a visible focus ring for summaries
and controls. Reduced motion removes the existing positional toast movement
and progress transition. Errors remain visible in result rows and reports.

## 7. Depth & Surface

Reuse current panels, neutral 1px borders, radii, and `--shadow` token.
New context blocks use `--panel2`, `--space-3` padding and the existing 10px
control radius (`--radius-control: 10px`). No accent edge stripes.

## 8. Accessibility Constraints & Accepted Debt

Use native checkboxes and disclosures, named controls, readable wrapping,
visible keyboard focus, and escaped user content. The compact desktop table
keeps deliberate horizontal overflow on phones. Existing fixed-width legacy
tables and small metric captions are retained; this is a dataset and model
extension, not a redesign. No light theme is introduced. API availability
depends on the account and region and must not be represented by mock results.
