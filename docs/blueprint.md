# Doaify — Daily Duas — Bot specification

**Archetype:** content

**Voice:** warm and encouraging — write every user-facing message, button label, error, and empty state in this voice.

Doaify is a Persian-language Telegram bot that serves a curated catalogue of short daily duas, lets users browse by category or get a random/today's dua, save favorites privately, set a single daily reminder in their local time, and send concise feedback to the owner/admin.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- Persian-speaking individuals seeking short daily prayers
- Users who want a lightweight personal library of favorite duas
- Users who want a single daily reminder for a short prayer

## Success criteria

- At least 95% of scheduled daily reminders are delivered to users who enabled reminders (monitor via delivery logs)
- Users can view, save, and remove favorites; favorites persist and reappear after relaunch
- Users can retrieve Today’s Dua, Random Dua, and browse seeded categories via buttons
- Feedback submitted by users is delivered to ADMIN_CHAT_ID and visible to owner
- No AI-generated dua content; all delivered duas are from the stored catalogue

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open the main menu and show a short tutorial + quick setup (timezone / reminders)
  - outputs: welcome_message, main_menu_buttons
- **/help** (command, actor: user, command: /help) — Show brief usage hints and how to set reminders or send feedback
  - outputs: help_text
- **/today** (command, actor: user, command: /today) — Send Today’s Dua immediately
  - outputs: dua_item_view
- **/random** (command, actor: user, command: /random) — Send a random dua from the catalogue
  - outputs: dua_item_view
- **دُعای امروز** (button, actor: user, callback: menu:today) — Show Today’s Dua
  - outputs: dua_item_view
- **دُعای تصادفی** (button, actor: user, callback: menu:random) — Show a Random Dua
  - outputs: dua_item_view
- **دسته‌ها** (button, actor: user, callback: menu:categories) — Open categories list (seeded with up to 8 themes)
  - outputs: categories_list
- **مورد علاقه‌ها** (button, actor: user, callback: menu:favorites) — Open user's private favorites list
  - outputs: favorites_list
- **یادآوری** (button, actor: user, callback: menu:reminders) — Open the reminder setup flow (set time or turn off)
  - outputs: reminder_flow
- **بازخورد** (button, actor: user, callback: menu:feedback) — Open the quick feedback form to send a message to admin
  - inputs: text:feedback_message
  - outputs: feedback_confirmation, admin_notification

## Flows

### Onboarding
_Trigger:_ /start

1. Send warm Persian welcome and one-sentence tutorial
2. Explain favorites, reminders, and how to browse (all in concise Persian)
3. Show main menu with buttons: Today's Dua, Random Dua, Categories, Favorites, Reminders, Feedback
4. Ask optionally for timezone (offer quick detect or manual entry); store if provided

_Data touched:_ User profile

### Browse Catalog / Quick Retrieval
_Trigger:_ menu:today | /today | menu:random | /random | category selection

1. Resolve requested dua: today/random/category list
2. Render Dua view message: Arabic/Persian text, optional transliteration, optional brief explanation
3. Include inline buttons: Save (callback), Share (native forward button), More like this (callback to similar category)

_Data touched:_ Dua item, User profile

### Category Browse & Pagination
_Trigger:_ menu:categories

1. Show up to 8 seeded categories as inline buttons (Morning, Evening, Travel, Healing, Forgiveness, Gratitude, Protection, Other)
2. When user taps a category, list first page of dua titles with 'View' callbacks and pagination arrows if > page size
3. User taps 'View' to open Dua view

_Data touched:_ Dua item

### View Dua & Save/Remove Favorite
_Trigger:_ dua view button | view callback

1. Display full dua content and buttons: Save / Remove (stateful), Share, More like this
2. If user taps Save, add dua_id to user's favorites and show confirmation toast
3. If user taps Remove, remove from favorites and show confirmation

_Data touched:_ Dua item, Favorite list, User profile

### Set or Disable Daily Reminder
_Trigger:_ menu:reminders | /reminder

1. Show current reminder state (on/off) and timezone if set
2. If setting a reminder: prompt for local time (use ForceReply or quick presets) and optionally confirm timezone; validate input
3. Store reminder time and timezone in user profile, schedule job for daily delivery
4. Confirm success to user in Persian and show how to disable

_Data touched:_ User profile

### Daily Reminder Delivery (scheduled event)
_Trigger:_ scheduler at user.reminder_time in user.timezone

1. Pick dua for the day or use 'Today' generator
2. Send dua message to the user's chat with same Dua view layout (Save/Share/More like this)
3. Log delivery status; on failure, mark and optionally notify admin after repeated failures

_Data touched:_ User profile, Dua item, Delivery logs

### Feedback Submission
_Trigger:_ menu:feedback

1. Prompt user with a short ForceReply asking for feedback text (optionally attach screenshot)
2. Store feedback entry including user id, timestamp, and optional timezone
3. Send formatted notification to ADMIN_CHAT_ID with the user's message and a link to the user's Telegram id/profile
4. Acknowledge submission to the user with a thank-you message

_Data touched:_ Feedback, User profile

### Admin Error / Feedback Notification
_Trigger:_ feedback submission | critical error

1. Format and send a concise notification message to ADMIN_CHAT_ID containing event type, user id (if applicable), timestamp, and message content
2. If critical error and admin not configured, retry and store alert locally

_Data touched:_ Feedback, Error logs

## Owner-supplied settings

The OWNER provides these; they are collected in chat and injected into the environment at deploy. Read each one from the environment where it is used (`ctx.env.<KEY>` / `env.<KEY>` on Cloudflare Workers; `process.env.<KEY>` only as a Node/harness fallback — never the sole read). Do NOT invent your own way of learning the value, do NOT ask for it in a bot message, and do NOT hardcode a default.

- **ADMIN_CHAT_ID** — Where new feedback and critical error notifications are sent
  - this is the OWNER's own chat id; the platform already knows it. Read `ADMIN_CHAT_ID` via `ctx.env` (prefer toolkit `adminChatId` / `requireOwner`) — never ask a user, never treat whoever writes first as the admin, never invent claim-admin or open manage for everyone.
  - may be UNSET at runtime: the bot must still start, and the feature needing ADMIN_CHAT_ID must say so plainly instead of failing.

Your behavioral specs run WITHOUT these values, so no spec may depend on one.

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

An entity that merely NAMES an owner-supplied setting above (an admin chat, an API account) is not something to store or discover — read it from the environment.

- **Dua item** _(retention: persistent)_ — A stored dua entry with text and metadata
  - fields: dua_id, title, arabic_text, persian_text, transliteration (optional), short_explanation (optional), category, seeded (boolean), created_at, updated_at
- **User profile** _(retention: persistent)_ — Per-user settings and preferences
  - fields: user_id (telegram), language (default: fa), timezone (IANA string or offset), reminder_enabled (boolean), reminder_time (HH:MM local), created_at, last_active_at
- **Favorite list** _(retention: persistent)_ — User-owned collection of saved dua IDs
  - fields: user_id, favorite_dua_ids (ordered array), created_at, updated_at
- **Feedback** _(retention: persistent)_ — User-submitted feedback messages routed to admin
  - fields: feedback_id, user_id, message_text, attached_media_reference (optional), timestamp
- **Delivery logs** _(retention: persistent)_ — Records of scheduled reminder delivery attempts
  - fields: log_id, user_id, dua_id_sent, attempt_time_utc, status, error_message (optional)

## Integrations

- **Telegram** (required) — Bot API messaging, inline keyboards, ForceReply and native share
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- Set or update ADMIN_CHAT_ID (where feedback and critical errors are sent)
- Seed, add, edit, and remove dua catalogue entries (title, text, transliteration, explanation, category)
- Manage seeded category list (modify names or reorder)
- Pause or resume reminder delivery globally (emergency maintenance)
- Export feedback and basic user stats (user count with reminders enabled)

## Notifications

- Daily reminder message to user at their configured local time (if enabled)
- Confirmation messages after user sets or disables reminders
- Admin notification for each user feedback submission (sent to ADMIN_CHAT_ID)
- Admin notification on critical delivery failures (escalation after repeated failures)
- User-facing confirmations for save/remove favorite and successful feedback submission

## Permissions & privacy

- Favorites and user settings are private to each user and are not viewable by other users
- All dua content is curated and stored; no AI generation of dua text is performed by the bot
- Feedback messages sent to ADMIN_CHAT_ID include the user's Telegram ID and optional profile link so owner can follow up
- Owner must publish a privacy notice externally if required; bot stores only the listed entities
- No data is shared with third parties by default

## Edge cases

- User sets reminder but never provides a timezone — reminders cannot be scheduled until timezone is set or inferred
- Daylight Saving Time changes: scheduled times are interpreted in the user's IANA timezone; DST transitions may shift local delivery hour
- User blocks or deletes the bot — scheduled deliveries will fail (log and optionally notify admin after repeated failures)
- Duplicate save attempts: saving an already-saved dua should return an idempotent confirmation
- Admin chat (ADMIN_CHAT_ID) missing or incorrect — feedback cannot be delivered; owner must set or fix env variable
- Large catalogue pagination — UI limits per page and performance considerations
- Malformed time input: user submits an invalid time string — validate and reprompt with examples
- Multiple admins: current design supports one ADMIN_CHAT_ID; owner must update env to change recipient

## Required tests

- Dialog-level acceptance: run /start, accept onboarding, and verify main menu appears in Persian
- Browse: tap Categories → choose a seeded category → open a dua → verify content includes text, transliteration (if present), explanation (if present) and actionable buttons
- Save/Remove Favorite: save a dua, confirm presence in Favorites list, then remove and confirm removal
- Reminder setup: set a reminder time and timezone, simulate scheduler at that timezone and verify a daily dua message is delivered to the user chat
- Feedback: submit feedback and verify a formatted notification arrives at ADMIN_CHAT_ID containing user id and message
- Random/Today endpoints: call /random and /today and verify responses contain valid stored dua entries (no empty responses)
- Failure handling: unset ADMIN_CHAT_ID and submit feedback — bot should surface an admin-delivery error and store feedback for retry

## Assumptions

- Primary UI language is Persian (fa) by default; owner may add other languages later
- Catalogue is seeded by the owner with curated duas; the bot does not fetch or generate new duas externally
- Categories are seeded with: Morning, Evening, Travel, Healing, Forgiveness, Gratitude, Protection, Other
- Reminders are off by default; when enabled a user selects a single daily time in their local timezone
- Owner will provide ADMIN_CHAT_ID so feedback and error alerts are delivered
- Sharing uses Telegram's native forwarding / share functionality rather than external share APIs
