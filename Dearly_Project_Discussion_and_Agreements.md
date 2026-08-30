# Dearly — Project Discussion and Agreements

## Project Name
**Dearly**

## Project Concept
Dearly will be a **general digital gifting web platform** where users can create personalized online gifts and send them to loved ones through the internet.

Recipients will be able to open the gift through a web link without installing an application.

Core experience:

**Create → Personalize → Wrap → Send → Unwrap → React → Remember**

Dearly is not limited to Christmas. Christmas will be one supported occasion.

## Main Gift Types
Initial gift types:
- Digital Letter
- Greeting Card
- Virtual Flowers
- Memory Album
- Gift Box
- Wish Jar

Possible future gift types:
- Voice Message
- Video Message
- Digital Scrapbook
- Memory Capsule
- Interactive Christmas Tree
- Countdown Gift

## Occasion Selector
Users will choose the occasion before browsing templates.

Initial occasions:
- Christmas
- Birthday
- Anniversary
- Valentine's Day
- Graduation
- Mother's Day
- Father's Day
- Wedding
- Congratulations
- Thank You
- Friendship
- Just Because
- Other
- No Specific Occasion

The selected occasion will filter and recommend relevant templates.

## Template System
Users can:
1. **Choose a Template**
2. **Start From Scratch**

Templates will be editable and categorized by:
- Occasion
- Gift Type
- Style
- Recipient

Example styles:
- Romantic
- Cozy
- Minimal
- Elegant
- Cute
- Fun
- Heartfelt
- Classic

Templates should be structured and editable rather than flattened images.

## Recipient Selector
Users may optionally choose who the gift is for to improve recommendations.

Examples:
- Partner
- Crush
- Best Friend
- Friend
- Mother
- Father
- Parent
- Sibling
- Family
- Child
- Coworker
- Teacher
- Someone Special
- Other

## Gift Builder
The editor will be a **structured gift editor**, not a full Canva-style freeform canvas.

Users can customize:

### Content
- Recipient Name
- Sender Name
- Message
- Signature
- Captions
- Photos

### Design
- Colors
- Background
- Typography
- Layout Variants
- Decorations

### Effects
- Hearts
- Snow
- Confetti
- Sparkles
- Floating Particles
- Fade Transitions

The editor should provide a live preview.

## Gift Box Concept
A Gift Box can contain multiple digital gift items, such as:
- Letter
- Flowers
- Photos
- Music
- Final Surprise

Each item can have its own reveal experience.

## Recipient Experience
The recipient experience should feel like opening a real gift rather than simply viewing a webpage.

Flow:

**Gift Link → Introduction → Open Gift → Reveal Animation → Gift Content → Final Message → Reaction/Reply**

Recipients should not be required to create an account.

## Sharing and Delivery
Published gifts will receive a unique public web link.

Example:

`dearly.app/g/{publicId}`

Sharing options:
- Copy Link
- QR Code
- Native Share
- Messaging and social platforms through browser sharing

## Scheduled Opening
Users can optionally set a future date and time when the gift can be opened.

Before the opening time, the recipient will see a countdown.

The server must enforce the opening schedule.

## Privacy
Initial privacy options:
- Anyone with the private link can open the gift
- Optional PIN protection
- Optional opening date
- Optional expiration date
- Sender can disable the gift

## Authentication
Authentication will be **optional**.

### Guest Sender
Guest users can:
- Create
- Customize
- Preview
- Publish
- Share

Guest-created gifts can be managed through a private management link or secret edit token.

### Registered Sender
Registered users receive additional features such as:
- Saved drafts
- Gift history
- Gift management
- Scheduling
- Reaction tracking
- Editing after publishing
- Reusable templates

### Recipient
Recipients do not need an account for normal gifts.

## Gift Status
User-facing statuses:

**Draft → Wrapped → Published/Sent → Opened → Replied**

## Dashboard
Registered users will have a dashboard for:
- All Gifts
- Drafts
- Published Gifts
- Scheduled Gifts
- Opened Gifts
- Archived Gifts
- Saved Templates

Possible metrics:
- Gifts Created
- Gifts Opened
- Scheduled Gifts
- Reactions

## Seasonal Experience
Dearly remains a general gifting platform.

Seasonal occasions can be highlighted dynamically, such as Christmas in December or Valentine's Day in February, while other occasions remain available.

## Brand Direction
**Brand Name:** Dearly

Logo direction:
- Stylized **D**
- Envelope imagery
- Heart imagery
- Warm rose, coral, blush, peach, and burgundy tones
- Elegant, emotional, modern visual identity

Working tagline:

**Made with feeling. Sent with love.**

## Recommended Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Motion for React

### Backend
- Next.js Server Actions
- Next.js Route Handlers

### Database and Platform
- Supabase
  - PostgreSQL
  - Authentication
  - Storage

### Forms and Validation
- React Hook Form
- Zod

### Deployment
- Vercel

### Development
- Git
- GitHub

## Technical Decisions
The initial implementation should avoid unnecessary complexity. The following are not part of the initial stack unless later needed:
- Separate Express backend
- MongoDB
- Firebase
- Redux
- Redis
- Docker
- Microservices
- GSAP
- Full Canvas/Canva-style editor

## Project Workspace and Repository
Project workspace:

`D:\A\Dearly`

GitHub repository:

`https://github.com/JayEsmalla/Dearly.git`

Git commits should not include Codex or any `Co-authored-by` metadata.
