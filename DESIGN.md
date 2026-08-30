# Dearly Design System

**Status:** Active source of truth for Dearly's UI, UX, and front-end presentation  
**Applies to:** Marketing pages, gift creation, gift management, and recipient experiences

This document defines how Dearly should look, feel, move, and communicate. New front-end work should follow these standards before introducing new visual patterns.

## 1. Design Direction

### Editorial Love-Letter Atelier

Dearly should feel like a handwritten keepsake refined by an editorial designer: warm paper, expressive typography, pressed flowers, envelopes, ribbons, and carefully imperfect arrangements.

The experience is:

- **Emotional, not sentimental:** Warm and sincere without becoming childish or overly decorative.
- **Crafted, not corporate:** It should feel made by a person, not assembled from generic dashboard components.
- **Elegant, not formal:** Refined typography and generous space should still feel welcoming.
- **Magical, not confusing:** Delight belongs in the reveal; the creation flow remains clear and predictable.
- **Digital, but tactile:** Paper, ink, folds, seals, and depth make the browser experience feel gift-like.

### Signature Idea

The memorable Dearly moment is the transition from a calm creation interface into a theatrical recipient reveal. The sender should feel like they are preparing a real gift, and the recipient should feel like they are opening one.

### Brand Promise

**Made with feeling. Sent with love.**

## 2. Experience Principles

### Feeling First

Lead with the person, occasion, and message. Avoid exposing technical decisions unless the user needs them.

### Guide One Decision at a Time

Use progressive steps for occasion, gift type, personalization, wrapping, and delivery. Each screen should have one obvious primary action.

### Show the Result Early

Personalization tools should update a live preview. Users should not need to imagine how their gift will look.

### Protect the Reveal

Sender tools may be practical, but recipient screens must remain immersive. Navigation, account prompts, and platform promotion should never interrupt the opening moment.

### Make Empty States Feel Inviting

Blank drafts should include gentle prompts and tasteful defaults rather than empty white boxes.

### Accessibility Is Part of the Gift

Keyboard navigation, readable contrast, reduced motion, semantic structure, and clear focus states are required—not optional finishing work.

## 3. Brand Foundations

### Color System

| Token | Value | Role |
|---|---:|---|
| `--paper` | `#FFFAF5` | Primary page background and warm neutral surface |
| `--paper-deep` | `#F7EEE6` | Secondary surface and subtle section contrast |
| `--ink` | `#3F1720` | Primary text and strongest readable foreground |
| `--muted` | `#785F61` | Supporting copy and secondary information |
| `--wine` | `#6F1D35` | Primary brand action, headings, and controls |
| `--wine-dark` | `#4B1022` | Dark immersive sections and strong action states |
| `--coral` | `#E56F61` | Emotional accent, emphasis, and active detail |
| `--rose` | `#EFB7AD` | Soft decorative accent and highlights |
| `--blush` | `#F8DCD4` | Large warm surfaces and recipient scenes |
| `--peach` | `#F6C79F` | Celebratory secondary accent |
| `--sage` | `#A9AD91` | Grounding botanical accent |
| `--line` | `rgba(75, 16, 34, 0.14)` | Borders, separators, and quiet structure |

Rules:

- Warm paper is the default background; pure white is reserved for cards and focused content surfaces.
- Wine is the default primary-action color.
- Coral is an accent, not a body-text color on light surfaces.
- Dark sections use wine-dark with paper or blush foregrounds.
- New colors must belong to a named gift theme or communicate a meaningful state.
- Do not introduce purple-to-blue gradients, neon accents, or cool gray interfaces.

### Typography

| Purpose | Typeface | Guidance |
|---|---|---|
| Display and emotional copy | Fraunces Variable | Headlines, gift messages, signatures, and expressive labels |
| Interface and body copy | Manrope Variable | Navigation, forms, buttons, instructions, and metadata |

Rules:

- Display headlines use tight tracking and compact line height.
- Italic Fraunces highlights emotionally important words, never whole paragraphs.
- Body text should remain between `0.78rem` and `1.05rem` with generous line height.
- Uppercase labels use Manrope, small sizing, heavy weight, and wide letter spacing.
- Avoid Inter, Arial, Roboto, system font stacks, and additional display fonts.

Recommended type scale:

| Style | Size | Line height | Use |
|---|---|---|---|
| Hero | `clamp(3.5rem, 6.25vw, 7rem)` | `0.93` | Marketing statement only |
| Page title | `clamp(3.1rem, 5.5vw, 5.8rem)` | `0.92` | Creation and major workflow pages |
| Section title | `clamp(2.8rem, 5vw, 5.4rem)` | `0.98` | Primary section headings |
| Card title | `1.25rem–1.65rem` | `1.1–1.2` | Cards and selectable options |
| Body | `0.85rem–1rem` | `1.7–1.85` | Explanatory content |
| Label | `0.58rem–0.68rem` | `1.4–1.6` | Steps, fields, and metadata |

### Spacing

Use a consistent 4-pixel base rhythm.

`4, 8, 12, 16, 24, 32, 48, 64, 96, 128`

- Page gutters: `20px` mobile, `clamp(32px, 6vw, 96px)` desktop.
- Major section spacing: `88px–160px` depending on viewport.
- Component spacing: prefer `12px`, `16px`, or `24px`.
- Related labels and inputs: `6px–8px`.
- Use generous negative space around emotional copy and gift previews.

### Layout

- Maximum marketing content width: `1440px`.
- Maximum focused workflow width: `1250px–1400px`.
- Marketing layouts may be asymmetric and editorial.
- Workflow layouts should use stable two-column structures: decisions on the left, preview or choices on the right.
- Recipient experiences should center the gift and remove unrelated interface elements.
- Do not center every section or place every feature inside an identical card grid.

### Shape and Borders

- Standard border: `1px solid var(--line)`.
- Primary actions: fully rounded pill.
- Input controls: square or subtly softened corners; avoid oversized rounded form fields.
- Gift and paper surfaces: slightly imperfect rotation between `-5deg` and `5deg` when decorative.
- Recipient phone or presentation frames may use larger, expressive radii.
- Use circles for seals, step markers, theme swatches, and small symbolic controls.

### Depth and Texture

- Shadows should resemble layered paper, not floating software panels.
- Preferred shadow color is translucent wine, not neutral black.
- Use subtle grain, dashed stitching, paper folds, botanical forms, and envelope geometry.
- Decorative texture must never reduce text readability.
- Avoid glassmorphism, glossy 3D icons, stock illustration packs, and generic gradient blobs.

## 4. Core Components

### Brand Mark

- Use the stylized heart-and-wordmark combination where space allows.
- The compact heart mark may be used for seals, favicons, and small controls.
- Keep the mark wine/coral on light backgrounds and blush/paper on dark backgrounds.
- Never stretch, outline heavily, or place the mark inside an unrelated geometric container.

### Header

- Marketing header: brand left, navigation centered, primary action right.
- Workflow header: brand left, progress or context centered, exit/back action right.
- Mobile headers hide nonessential navigation but retain the primary action or back control.

### Buttons

Primary:

- Wine background with paper text.
- Pill shape, compact label, and right arrow.
- Hover raises the button `2px–3px` and slightly deepens the shadow.

Secondary:

- Paper background on dark or colored surfaces.
- Wine text with the same pill proportions as primary actions.

Text action:

- Plain text with a quiet underline or directional arrow.
- Use for back, replay, change, and low-priority navigation.

Rules:

- Use one primary action per decision area.
- Button labels should describe the outcome: “Personalize your gift,” not “Continue.”
- Disabled actions must look disabled and explain what is missing nearby.

### Choice Cards

- Show the choice name, a short emotional description, and a directional cue.
- Occasion lists favor editorial rows; gift types favor illustrated cards.
- Hover may raise, rotate slightly, or change paper color.
- Selected cards require more than color alone: border, check, label, or shape change.

### Forms

- Labels sit above fields and use uppercase interface styling.
- Helper text and counts align with the label row.
- Inputs use paper surfaces with wine/coral focus treatment.
- Errors appear beneath the field with plain-language recovery guidance.
- Preserve user input when moving backward through the creation flow.

### Progress

- Use a three-segment progress line for short creation flows.
- Always pair visual progress with readable text such as “Step 2 of 3.”
- Progress describes meaningful user decisions, not every technical screen.

### Live Preview

- Preview appears beside controls on large screens and below them on small screens.
- The preview must reflect content and theme changes immediately.
- A quiet “Live preview” indicator is acceptable in sender tools but never in the recipient view.

### Modal and Recipient Reveal

- The preview modal occupies the full viewport and visually leaves the editor behind.
- Begin with anticipation: recipient name, wrapped object, and one clear open action.
- Reveal motion should be brief, purposeful, and replayable.
- Keep close controls available and keyboard reachable.

### Status and Feedback

Use consistent language:

- Draft
- Wrapped
- Published or Sent
- Opened
- Replied

Success feedback should be warm but direct. Error feedback should be calm, specific, and never blame the user.

## 5. Interaction States

Every interactive component must define:

- Default
- Hover
- Keyboard focus
- Active or pressed
- Selected, when applicable
- Disabled
- Loading, when applicable
- Error and success, when applicable

Focus states must remain visible against every gift theme. Do not remove outlines without providing an equally visible replacement.

## 6. Motion

Motion supports three purposes:

1. **Orientation:** Explain where content came from or what changed.
2. **Tactility:** Give cards, buttons, and wrapping elements a physical response.
3. **Emotion:** Make the opening and reveal feel special.

Guidelines:

- Interface transitions: `180ms–300ms`.
- Page or reveal entrances: `450ms–800ms`.
- Preferred easing: smooth cubic curves with a gentle landing.
- Use one coordinated entrance rather than constant unrelated movement.
- Decorative floating motion must remain slow and subtle.
- Respect `prefers-reduced-motion`; all functionality must work without animation.
- Never delay task completion for decorative animation.

## 7. Responsive Behavior

| Range | Behavior |
|---|---|
| Up to `620px` | Single-column workflows, compact header, stacked fields |
| `621px–760px` | Mobile marketing layout and single-column gift cards |
| `761px–900px` | Compact tablet layout; preview may move below controls |
| `901px–1100px` | Two-column layouts with reduced spacing |
| Above `1100px` | Full editorial compositions and expanded navigation |

Rules:

- Design mobile layouts deliberately; do not merely shrink desktop components.
- Keep touch targets at least `44px` where practical.
- Avoid horizontal scrolling at every supported width.
- Gift text must remain readable without zooming.
- On small screens, content order is: context, controls, primary action, preview.

## 8. Accessibility

- Meet WCAG AA contrast for text and functional controls.
- Use semantic headings in a logical hierarchy.
- Give decorative artwork `aria-hidden="true"`.
- Give previews and dialogs useful accessible names.
- All creation and unwrapping actions must work by keyboard.
- Use real labels for every form field.
- Never communicate state through color alone.
- Maintain readable layouts at 200% zoom.
- Announce important async status changes with appropriate live regions.
- Trap focus inside modal dialogs when production dialog behavior is introduced.

## 9. Content and Voice

Dearly speaks like a thoughtful friend with excellent taste.

Use:

- Warm, short sentences.
- Concrete outcomes.
- Gentle encouragement.
- Human words such as “make,” “open,” “wrap,” “remember,” and “send.”

Avoid:

- Corporate language such as “asset,” “content object,” or “user artifact.”
- Artificial urgency.
- Excessive exclamation marks.
- Claims that a gift is saved, private, scheduled, or published before the system confirms it.
- Generic labels such as “Submit” when a specific action is possible.

Example:

- Prefer: **Wrap & preview**
- Avoid: **Proceed to next step**

## 10. Page Patterns

### Marketing

- Lead with emotional value, then explain the mechanism.
- Use tactile illustrations and asymmetrical compositions.
- Alternate quiet paper sections with one or two immersive color sections.
- End major pages with a confident, singular creation action.

### Gift Creation

- Present one decision stage at a time.
- Keep progress visible.
- Provide reassuring defaults.
- Show the gift preview as soon as personalization begins.
- Separate publishing and privacy decisions from creative editing.

### Dashboard

- Preserve Dearly's warmth while increasing information density.
- Favor editorial lists and compact status chips over generic analytics cards.
- Place the most recent or actionable gifts first.
- Metrics should help users act, not decorate the page.

### Recipient Experience

- Hide sender tools, dashboard navigation, and unrelated calls to action.
- Center anticipation, reveal, content, and reaction.
- Keep Dearly branding quiet and secondary to the gift.
- Ensure scheduled, PIN-protected, expired, and disabled states remain gracious and clear.

## 11. Front-End Implementation Rules

- Define reusable color, type, spacing, motion, and shadow values as CSS custom properties.
- Reuse existing components before creating variants.
- Keep content data separate from visual presentation when lists or templates repeat.
- Prefer CSS for simple decorative motion; add a motion library only for complex state choreography.
- Avoid absolute positioning for essential layout or reading order.
- Optimize illustrations and effects for fast first paint.
- Test every new surface at mobile, tablet, and desktop widths.
- Verify lint, type checking, production build, keyboard use, and reduced motion before release.

## 12. Design Review Checklist

Before merging a front-end change, confirm:

- Does it feel like a crafted digital gift rather than a generic web app?
- Is there one obvious primary action?
- Does it use the established color and typography system?
- Is the layout intentional on mobile and desktop?
- Are hover, focus, selected, disabled, error, and loading states covered?
- Is the preview or outcome visible early enough?
- Does the copy describe a human outcome?
- Does it work without motion and with keyboard navigation?
- Is recipient attention kept on the gift?
- Has unnecessary decoration or component variation been removed?

## 13. Governance

- `DESIGN.md` is the design source of truth.
- Changes to brand foundations or core component behavior must update this file in the same change.
- Page-specific experiments may extend the system but must not silently redefine it.
- When implementation and this document disagree, either align the implementation or explicitly update the design decision here.
- Prefer evolving a shared pattern over creating a one-page exception.
