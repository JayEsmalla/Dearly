# Dearly Front-End Design

**Design source of truth** · UI, UX, typography, layout, and interaction

## 1. North Star

Dearly is a **modern correspondence studio**: calm enough to write in, warm enough to feel personal, and theatrical only when the recipient opens the gift.

The sender interface is compact and task-first. The recipient experience is spacious and emotional.

**Promise:** Made with feeling. Sent with love.

### Design principles

1. **One decision per view.** The next action is always obvious.
2. **Preview early.** Show the gift as soon as the sender adds content.
3. **Keep the sender moving.** Avoid oversized headings, decorative dead space, and long setup forms.
4. **Save the magic for the reveal.** Creation feels calm; opening feels special.
5. **Say exactly what happens.** Never imply saving, publishing, privacy, or delivery before it is real.
6. **Accessible by default.** Keyboard, contrast, zoom, semantics, and reduced motion are release requirements.

## 2. Primary User Journey

The front end is organized around the sender’s actual sequence:

| Moment | User question | UI response | Primary action |
|---|---|---|---|
| Discover | “Can I make something meaningful here?” | Show a real gift preview and the short process | Create a gift |
| Occasion | “What am I celebrating?” | Compact, scannable occasion choices | Choose an occasion |
| Format | “What kind of gift fits?” | Six concise gift-format cards | Choose a gift type |
| Personalize | “What should I say?” | Focused fields beside a live preview | Wrap & preview |
| Check | “What will they experience?” | Full recipient preview | Open gift |
| Publish | “How do I send it?” | Later phase: privacy, schedule, and link controls | Publish gift |

### Friction rules

- A first-time sender reaches personalization in three selections or fewer.
- The primary action appears within the initial viewport on common laptop screens.
- No step asks for information that is not needed yet.
- Back actions preserve context in the URL and, once persistence exists, preserve entered content.
- Mobile layouts show controls before preview; desktop shows them side by side.

## 3. Information Architecture

### Current Phase 1

```text
/
└── /create
    ├── occasion
    ├── gift type
    └── /create/personalize
        ├── content
        ├── theme
        └── recipient preview
```

### Planned product structure

```text
/
├── /create
├── /g/{publicId}          recipient experience
├── /dashboard
│   ├── gifts
│   ├── drafts
│   └── templates
└── /gift/{id}/manage      privacy, delivery, reactions
```

Do not add top-level routes until a real user task requires them.

## 4. Page Blueprints

### Landing page

Goal: establish emotional value and move interested users into creation quickly.

Order:

1. Compact header
2. Hero with product promise, primary action, and real gift preview
3. Occasion shortcuts
4. Gift formats
5. Three-step explanation
6. Recipient experience proof
7. Final action and compact footer

Rules:

- Hero fits comfortably within one laptop viewport.
- Use one headline, one supporting paragraph, and no more than two actions.
- Product UI or gift preview carries more weight than decorative copy.
- Keep the page to roughly four to five screen lengths on desktop.

### Occasion and gift selection

Goal: help the sender decide without reading a long page.

- Keep context and progress in a compact left rail on desktop.
- Use two-column selection grids where space allows.
- Occasion cards are short rows; gift cards include one simple symbol and one sentence.
- Keep all common options visible within one or two viewports.
- The selected occasion remains visible while choosing a format.

### Personalization editor

Goal: let the sender write and immediately understand the result.

- Fixed-width control panel: approximately `360px–420px`.
- Preview takes remaining space.
- Put recipient, sender, message, theme, and primary action in that order.
- Keep “Wrap & preview” visible without excessive scrolling on a typical laptop.
- Use a compact device or canvas frame; the content matters more than browser chrome.
- Phase limitations appear as quiet helper text, not a dominant warning.

### Recipient preview

Goal: demonstrate anticipation and reveal without sender-interface clutter.

- Full viewport.
- One close action.
- Recipient name, wrapped object, and one open action.
- Reveal is readable, replayable, and functional with reduced motion.
- Dearly branding is secondary to the message.

### Future dashboard

Goal: help a returning sender act on gifts, not admire analytics.

- Start with recent gifts and status.
- Use a compact editorial list before introducing card grids.
- Statuses: Draft, Wrapped, Published, Opened, Replied.
- Metrics are secondary and only included when they help make a decision.

## 5. Visual Language

### Direction

**Modern correspondence studio**

- Warm paper foundations
- Fine ink borders
- Compact editorial layouts
- Quiet botanical and envelope motifs
- Small moments of tactile depth
- Controlled coral highlights

Avoid generic SaaS dashboards, glass panels, purple gradients, glossy 3D icons, large empty hero areas, and repeated oversized serif headlines.

### Typography

| Role | Typeface | Use |
|---|---|---|
| Editorial display | Newsreader Variable | Brand, headlines, gift messages, signatures |
| Interface and reading | Figtree Variable | Navigation, fields, buttons, labels, body copy |

Type rules:

- Display type is restrained, not monumental.
- Italics highlight one emotional phrase, never an entire paragraph.
- Interface copy uses normal casing except small metadata labels.
- Body copy is at least `15px` on sender screens and `16px` for recipient messages.
- Line length stays near `55–70` characters.

### Type scale

| Token | Desktop | Mobile | Use |
|---|---:|---:|---|
| `--text-hero` | `clamp(3.25rem, 5vw, 5.25rem)` | `clamp(2.8rem, 13vw, 4rem)` | Landing hero only |
| `--text-page` | `clamp(2.5rem, 4vw, 4rem)` | `2.75rem` | Workflow title |
| `--text-section` | `clamp(2.1rem, 3.2vw, 3.4rem)` | `2.35rem` | Marketing sections |
| `--text-card` | `1.2rem` | `1.1rem` | Choice and feature cards |
| `--text-body` | `0.95rem` | `0.95rem` | Reading copy |
| `--text-label` | `0.7rem` | `0.68rem` | Metadata and field labels |

### Color tokens

| Token | Value | Role |
|---|---:|---|
| `--paper` | `#FCF8F3` | Page background |
| `--surface` | `#FFFDF9` | Cards and inputs |
| `--surface-warm` | `#F4EAE2` | Secondary panels |
| `--ink` | `#32171D` | Primary text |
| `--muted` | `#715E61` | Supporting text |
| `--wine` | `#6D263B` | Primary action and brand |
| `--wine-strong` | `#491524` | Dark surface and hover |
| `--coral` | `#DF7468` | Emotional accent |
| `--blush` | `#EFC2B8` | Gift and illustration surface |
| `--sage` | `#8D987E` | Botanical theme |
| `--gold` | `#C58A49` | Celebratory theme |
| `--line` | `rgba(73, 21, 36, 0.14)` | Structure and dividers |
| `--focus` | `#B94E61` | Keyboard focus ring |

Rules:

- Use wine for primary actions.
- Coral is an accent, not small body text.
- Pure white is reserved for cards and gift paper.
- A page uses one dominant warm surface and no more than two accents.
- New colors require a functional state or named gift theme.

### Spacing and density

Base rhythm: `4px`.

```text
4  8  12  16  20  24  32  40  48  64  80  96
```

- Header height: `64px` desktop, `60px` mobile.
- Page gutter: `20px` mobile, `32px–64px` desktop.
- Marketing section padding: `64px–96px` desktop, `48px–64px` mobile.
- Workflow section padding: `32px–56px`.
- Standard control height: `44px–48px`.
- Card padding: `16px–24px`.
- Standard gap: `12px` or `16px`.

Compact means reducing empty space, not reducing readability or touch targets.

### Grid

- Marketing maximum width: `1240px`.
- Workflow maximum width: `1120px`.
- Text column maximum: `620px`.
- Editor controls: `360px–420px`.
- Standard desktop grid: 12 columns.
- Compact choice grids: 2 columns; gift formats may use 3 on wide screens.

### Shape and depth

- Default radius: `12px`.
- Compact radius: `8px` for fields and rows.
- Pill radius is reserved for primary actions, status, and filters.
- Default border: `1px solid var(--line)`.
- Shadows use translucent wine and stay close to the surface.
- Decorative paper may rotate up to `2deg`; functional UI remains aligned.

## 6. Components

### Header

- Brand left, key navigation center, primary action right.
- Workflow header shows progress and exit/back context.
- Mobile hides secondary navigation, not the primary action.

### Buttons

- One primary action per region.
- Labels describe outcomes: “Choose Birthday,” “Personalize gift,” “Wrap & preview.”
- Primary buttons use wine, paper text, and a directional arrow.
- Secondary actions use a border or text treatment.
- Hover moves no more than `2px`; focus uses a visible `3px` ring.

### Choice cards

- Entire card is interactive.
- Name is the strongest element; description is one line when possible.
- Selected state uses shape or icon plus color.
- Hover changes border and background without dramatic rotation.

### Forms

- Labels above fields.
- Helper text and character counts share the label row.
- Error copy appears directly beneath the field.
- Inputs use at least `44px` height and a visible focus ring.
- Message field should show roughly four lines before scrolling.

### Progress

- Show readable step text and a short segmented line.
- Keep progress visible during creation.
- Count meaningful decisions, not technical pages.

### Preview

- Live updates are immediate.
- Preview content remains legible at compact sizes.
- A subtle label distinguishes sender preview from recipient mode.

### Dialog

- Full recipient preview uses a modal or dedicated route.
- Close control is always visible.
- Production dialogs trap focus and restore it on close.
- Escape closes non-destructive previews.

## 7. Interaction and Motion

Motion exists for orientation, tactility, or reveal.

- Interface feedback: `160ms–220ms`.
- Page entrance: `300ms–450ms`.
- Gift reveal: `500ms–800ms`.
- Use one coordinated entrance, not constant ambient movement.
- Never delay the next action for decoration.
- Honor `prefers-reduced-motion` with equivalent instant states.

Every interactive element defines default, hover, focus, active, selected, disabled, loading, error, and success where applicable.

## 8. Responsive Rules

| Width | Layout |
|---|---|
| `< 640px` | Single column, compact header, stacked fields |
| `640px–899px` | Single-column workflow with wider cards |
| `900px–1199px` | Two-column layouts with reduced gutters |
| `≥ 1200px` | Full compact editorial layout |

- Minimum practical touch target: `44px`.
- No horizontal scrolling.
- Mobile content order: context → controls → action → preview.
- Avoid hiding essential information behind hover.
- Test at `390×844`, `768×1024`, and `1280×720`.

## 9. Accessibility

- WCAG AA contrast for text and controls.
- Logical heading hierarchy.
- Visible keyboard focus on every interactive element.
- Real labels for form fields.
- State never relies on color alone.
- Decorative artwork is hidden from assistive technology.
- Functional UI works at 200% zoom.
- Async feedback uses appropriate live regions.
- Recipient text remains readable without animation.

## 10. Voice

Dearly sounds like a thoughtful friend: warm, concise, and specific.

Prefer:

- Create a gift
- Choose the moment
- Write what you want them to remember
- Wrap & preview
- Open your gift

Avoid:

- Submit
- Proceed
- Create artifact
- Configure experience
- Artificial urgency or excessive exclamation marks

## 11. Front-End Standards

- Centralize tokens as CSS custom properties.
- Reuse shared brand, button, progress, card, and field patterns.
- Keep server components by default; use client components only for interaction.
- Use `Link` for app navigation.
- Keep essential layout in normal document flow.
- Prefer CSS for simple motion and illustration.
- Do not add a dependency unless the user experience requires it.
- Verify lint, types, production build, keyboard use, reduced motion, and responsive layouts before release.

## 12. Redesign Acceptance

The compact redesign is complete when:

- The landing hero and primary action fit within `1280×720`.
- Occasion and gift choices are faster to scan than the previous long-list layout.
- The personalization action is reachable without excessive scrolling.
- Typography is consistent across sender and recipient surfaces.
- The full Phase 1 journey works on desktop and mobile.
- No current behavior is lost.
- Lint, strict type checking, and production build pass.

## 13. Design Review

Before merging a front-end change, ask:

1. Is the next action obvious?
2. Did we remove unnecessary height, copy, or decoration?
3. Is the content still comfortable to read and tap?
4. Does it use the shared type, color, spacing, and component rules?
5. Is the sender interface calm and the recipient reveal special?
6. Does it work by keyboard, without motion, and on mobile?
