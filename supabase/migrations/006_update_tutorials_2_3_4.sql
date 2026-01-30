UPDATE public.resources SET description = 'Pick the right AI tools and wire them into your day. A 2026 overview of code assistants and how to use them.' || E'\n\n---\n\n' || $_TUTBODY_$
# AI-Powered Development: Tools and Workflows for Vibecoders

This tutorial gives you a 2026 overview of AI coding tools and how to wire them into your daily workflow so you ship faster without losing control.

---

## The 2026 AI coding landscape

Code assistants are no longer toys. They read your repo, run commands, and fix their own mistakes in a loop. The difference between "trying AI" and "vibecoding" is treating the tool as a partner: you set direction and quality; the AI handles volume and repetition.

### In-editor code assistants

**Cursor**  
- Strong all-rounder. Composer does multi-file edits; chat has full codebase context.  
- Best for: full-stack apps, quick iteration, daily coding.  
- Tip: Use @file and @folder to point at the code that matters.

**Windsurf**  
- Codebase-aware, good for autonomous multi-step tasks.  
- Best for: larger refactors, "do this across the whole project" style work.  
- Tip: Break big tasks into clear steps so the agent doesn’t wander.

**Bolt (StackBlitz)**  
- Runs in the browser; no local install.  
- Best for: demos, sharing with others, quick prototypes.  
- Tip: Great for "here’s the link" feedback without "clone and run."

**Claude Code / IDE integrations**  
- Deep reasoning and long context.  
- Best for: architecture decisions, complex refactors, design discussions.  
- Tip: Use for "why should we do X?" and "refactor this module" more than tiny edits.

### How to choose

- **Solo vibecoding, fast shipping** → Cursor or Windsurf.  
- **Need it in the browser or shareable** → Bolt.  
- **Complex refactors, design, architecture** → Claude Code or similar.

You can use more than one. Many vibecoders use Cursor daily and Claude for design and refactors.

---

## Workflow habits that scale

### 1. One task per conversation

Start a new chat when you switch tasks. "Add export to CSV" in one thread; "fix the login redirect" in another. Mixed threads lead to wrong context and wasted tokens.

### 2. Point at the right files

Use @file and @folder (or your editor’s equivalent) so the model sees:

- The component or API you’re changing  
- The types or helpers it should use  
- The style you want (e.g. an existing form or table)

Example: "Add a submit handler to this form. Use the same validation pattern as in @lib/validation.ts and the Button from @components/ui."

### 3. Accept partial wins

Often the first output is 80% right. Take it, fix the last 20% yourself, and move on. Iterating in chat forever is slower than a quick manual fix.

### 4. Version control everything

Commit after every working state. If the next prompt goes wrong, you can revert. Use meaningful commit messages: "Add CSV export to reports page" not "updates."

### 5. When to step in yourself

AI is best at:

- Scaffolding (components, API routes, migrations)  
- Tests (unit, integration)  
- Docs and comments  
- Repetitive patterns (mapping, validation, CRUD)  
- Renaming and refactoring

You should still own:

- Product and feature decisions  
- Architecture and security  
- Final UX and copy  
- When to reject or rewrite AI output

Vibecoding is partnership: you steer, the AI amplifies.

---

## Setting up your project for AI

### Naming and structure

- Use clear file and folder names. "DashboardStats.tsx" and "api/reports/route.ts" are easier for the model to reason about than "stuff.ts" and "api/x/route.ts."
- Keep related code close. Same feature → same folder or clear imports.

### Comments and types

- Export types and use them in function signatures. The model can follow types to stay consistent.
- One-line comments on non-obvious logic help: "Only run if user has export permission."

### Dependencies

- List your stack in the first message of a session: "Next.js 14, App Router, Supabase, Tailwind."
- Avoid "use the best library" without naming one. Prefer "use our existing date lib" or "use date-fns."

---

## Example: Adding a feature end-to-end

**Goal:** Add "Export to CSV" to a reports table.

1. **New chat.** "We're in a Next.js 14 app, App Router. The reports page is in app/dashboard/reports/page.tsx. I need to add an Export CSV button that downloads the current table data as CSV. Reuse our existing Button and match the table structure in the file."
2. **Review the diff.** Check: correct columns? Correct filename? Any hardcoded values?
3. **Run and test.** Click the button. Does the file download? Open the CSV. Correct?
4. **Follow-up if needed.** "Add loading state on the button while generating" or "If the table is empty, disable the button."
5. **Commit.** "Add CSV export to reports page."

That’s one feature in one focused conversation.

---

## When the AI goes wrong

- **Wrong API or types** – Attach the file that defines the correct type or function. "Use the User type from @types/index.ts."
- **Wrong architecture** – Be explicit. "We use server actions for mutations, not route handlers. Refactor to use a server action."
- **Too much change** – "Only change the submit handler. Don’t refactor the rest of the component."
- **Hallucinated APIs** – If it invents a library or API, say: "We don’t have that. Use the browser File API and Blob."

Staying specific and pointing at real code keeps the model on track.

---

## Security and safety

- **No secrets in chat.** Don’t paste API keys or passwords. Use env vars and say "use process.env.NEXT_PUBLIC_* for client-safe config."
- **Review dependencies.** If the AI suggests a new package, check it on npm and skim the repo. Don’t install blindly.
- **Sanitize inputs.** For export/download features, ensure the model doesn’t introduce injection or unsafe user content in generated files.

---

## Next steps

- **Prompting for Code** – Get better outputs by improving how you ask.  
- **Vibecoding in 2026** – From idea to shipped in small steps.  
- **Building in Public with AI** – Share your process and ship in the open.

You now have a clear map of the 2026 tools and habits: one task per chat, point at the right files, accept partial wins, commit often, and keep product and architecture in your hands.

$_TUTBODY_$ WHERE id = 'e0af0e40-a1e8-4982-9433-302e76a892b4'; UPDATE public.resources SET description = 'Small changes to how you ask for code lead to much better results. A practical guide to prompting for vibecoders.' || E'\n\n---\n\n' || $_TUTBODY_$
# Prompting for Code: Get Better Outputs from AI Assistants

Small changes to how you ask for code lead to much better results. This tutorial teaches you practical prompting patterns so you get correct, consistent code from your AI assistant in 2026.

---

## Why prompting matters

Same task, different prompt → different code. Vague prompts produce generic or wrong solutions; specific prompts produce code that fits your stack and style. The best vibecoders treat prompting as a skill: clear intent, enough context, and a structure the model can follow.

---

## Pattern 1: Role + task + constraints

Give the model a role, a clear task, and constraints (stack, style, files).

**Bad:** "Write a login form."

**Good:** "You're adding a login form to our Next.js app. Use the existing Button and Input from @/components/ui. Validate email format and require password at least 8 characters. Show inline errors under each field. Keep it accessible: labels, focus management, and error announcements."

Why it works: The model knows the stack (Next.js), the UI primitives (Button, Input), validation rules, and accessibility. It has less room to guess.

**Another example:**

**Bad:** "Add auth."

**Good:** "We use Supabase Auth. Add sign-in: email + password. On success redirect to /dashboard. On error show a toast with the message. Reuse our existing toast component and the AuthCard layout from @components/auth."

---

## Pattern 2: Show, don't only tell

Reference real files and patterns in your codebase.

- "Match the pattern in @lib/api.ts for error handling."
- "Use the same validation style as in auth.ts lines 40–60."
- "Follow the structure of DashboardStats.tsx for the new ReportsStats component."

Attach the file with @file or paste the relevant snippet. The model can mirror your patterns instead of inventing new ones.

---

## Pattern 3: One thing at a time

Break the work into small steps. One behaviour per message.

Instead of: "Add a form with validation, loading state, error handling, and success redirect."

Do:

1. "Add the form fields and submit button. Use our Input and Button from @components/ui."
2. "Add client-side validation: email format, password length. Show errors under each field."
3. "On submit, set loading state on the button and disable the form. Call the signIn function from @lib/auth."
4. "On success redirect to /dashboard. On error show a toast with the message."

Easier for the model to get each step right, and easier for you to correct one step without redoing the whole thing.

---

## Pattern 4: Specify the format you want

Tell the model how to respond.

- "Return a single async function. No explanation, just the code."
- "Respond with a JSON object: { code: string, explanation: string }."
- "Give me only the changed lines, with file path and line numbers."

Reduces junk (long explanations when you only need code) and rework (wrong format).

---

## Pattern 5: Constrain the solution space

Narrow what's allowed.

- "No new dependencies. Use only what's already in package.json."
- "Keep it in one file. Don't create new components yet."
- "Use server actions, not API routes."
- "Match our existing table styling. Don't add new CSS classes."

Prevents the model from adding libraries or patterns you don't want.

---

## When the output is wrong

### Too generic

Add constraints: stack, style, or "no new dependencies." Or point at a file: "Use the same structure as @components/OtherForm.tsx."

### Wrong API or types

Point at the exact type or function: "Use the User type from @types/index.ts" or "Use createClient from @lib/supabase/server, not the client module."

### Off-architecture

Describe the pattern: "We use server actions for mutations, not route handlers. Refactor to use a server action." Or "We keep all API calls in lib/api.ts. Move the fetch there and export a function."

### Hallucinated APIs

If the model invents a library or API: "We don't have that. Use the browser Fetch API and our existing getSession from @lib/auth."

### Too much change

"Only change the submit handler. Don't refactor the rest of the component." Or "Revert the styling changes. Only add the loading state."

---

## Advanced: Multi-file and refactors

For larger changes:

1. **List the files** – "We're changing Dashboard.tsx, lib/stats.ts, and adding components/ExportButton.tsx."
2. **Describe the flow** – "User clicks Export → we call getReportData from lib/stats → we format as CSV and trigger download in ExportButton."
3. **One file at a time** – "First add getReportData in lib/stats.ts. Then add ExportButton. Then wire it in Dashboard."

For refactors:

- "Refactor this component to use the same pattern as @components/UserCard: extract the header into a subcomponent, keep the body here."
- "Split this file into: types.ts (only types), utils.ts (pure functions), and component.tsx (UI). No behaviour change."

---

## Practice

1. Pick one small task (e.g. "add a loading spinner to the submit button").
2. Write a prompt using role + task + constraints and @file references.
3. Send it. Review the output. If something is wrong, correct with a specific follow-up.
4. Repeat with another task. Your prompts will improve as you learn what your editor and model need.

---

## Checklist before you send

- [ ] Did I say what stack/file we're in?
- [ ] Did I reference existing components or patterns (@file)?
- [ ] Did I give one clear task (or one clear step)?
- [ ] Did I add constraints (no new deps, use X, don't do Y)?
- [ ] Did I say what format I want (code only, one function, etc.)?

---

## Next steps

- **Vibecoding in 2026** – From idea to shipped using these prompting habits.
- **AI-Powered Development** – Tools and workflows that scale.
- **Building in Public with AI** – Share your process and prompts.

You now have a repeatable set of patterns: role + task + constraints, show don't just tell, one thing at a time, specify format, and constrain the solution. Use them and iterate.

$_TUTBODY_$ WHERE id = 'a989572f-52a9-487c-8842-99af9f2f5044'; UPDATE public.resources SET description = 'Ship in the open, iterate with the community, and use AI to move faster. How to build in public as a vibecoder in 2026.' || E'\n\n---\n\n' || $_TUTBODY_$
# Building in Public with AI: A Vibecoder's Guide

Ship in the open, iterate with the community, and use AI to move faster. This tutorial shows you how to build in public as a vibecoder in 2026—what to share, where, and how to turn your process into content and opportunity.

---

## What building in public means in 2026

Building in public is sharing your process: ideas, progress, blocks, and wins. You don't wait for a launch; you share the journey. With AI in the loop, you can ship more often and share more honestly—"here's what I tried, here's what the AI suggested, here's what I kept." That transparency is exactly what other makers and early users want to see.

---

## Why it fits vibecoding

### Speed

You ship faster. There's more to share: small wins, refactors, new features, demos. One ship per week (or more) gives you a steady stream of updates.

### Transparency

People are curious how you use AI. Showing your prompts, your iterations, and your "AI said X, I kept Y" builds trust and differentiates you from "I used AI" without details.

### Feedback

Early users and other makers give you signal before you over-invest. "Would you use this?" "What's missing?" "How would you integrate this?" Building in public turns your timeline into a feedback loop.

### Portfolio

Your timeline is proof of what you can ship with AI. Grant applications, job applications, and partnerships can point at real work and real process, not just a polished landing page.

---

## What to share

### 1. The idea and the "why"

Before you code, share the problem and the outcome you want.

- "Building a small tool to export Notion tables to CSV. I need this weekly and the existing solutions are clunky."
- "Starting a micro-SaaS for X. Here's who it's for and what I'm solving first."

You don't need to be certain. "Testing whether X is a real problem" is valid.

### 2. Progress and small wins

- "Shipped the export button today. One click, CSV downloads. Next: scheduling."
- "Refactored the auth flow with Cursor. Took 20 minutes. Here's the before/after."
- "First user signed up. Here's what they said."

Small wins are content. They show momentum and that you ship.

### 3. The stack and the workflow

- "Built with Next.js, Supabase, Cursor. Deployed on Vercel."
- "This feature: one Composer session, three prompts, one manual fix. Here's the prompt that worked."
- "How I got the AI to generate consistent API types: [short post or thread]."

People want to replicate. Sharing stack and workflow helps them and positions you as someone who ships with AI.

### 4. Blocks and pivots

- "Stuck on X. Tried Y and Z. Considering A. Any ideas?"
- "Pivoting from X to Y because of [feedback/data]. Here's what I learned."

Honesty about blocks and pivots builds trust and often brings help.

### 5. Launches and milestones

- "V1 is live: [link]. Here's what it does and what's next."
- "Hit 100 users. Thank you to everyone who gave feedback."
- "Submitted to [grant/hackathon]. Fingers crossed."

---

## Where to share

### X (Twitter)

- Short updates, screenshots, and "ship" threads.
- Best for: quick wins, demos, and conversations with other builders.
- Tip: Use a consistent hashtag or phrase (#vibecoding #buildinpublic) so people can find your updates.

### Indie Hackers / Dev.to

- Longer posts: how you built X, what you learned, tutorials.
- Best for: SEO, depth, and connecting with indie makers and developers.

### Your own blog or changelog

- Ownership and long-term SEO. You can repost elsewhere with a link.
- Best for: detailed write-ups, changelogs, and "state of the project" posts.

### Communities like Vamp

- Show projects, share learnings, apply for grants.
- Best for: feedback from people who care about vibecoding and grants.

### Newsletter

- Optional. If you like writing, a weekly or biweekly "what I shipped and what I learned" can build an audience over time.

---

## Practical habits

### 1. Ship something tiny first

A small tool, a CLI, or one API. Then post: what it does, how you built it, what you'd do next. You don't need a full product to start building in public.

### 2. Share the stack

"Built with Cursor + Next.js + Supabase." Others can replicate or remix. It also helps you get targeted feedback ("I use the same stack, here's how I'd do X").

### 3. Document one prompt or workflow

"How I got the AI to generate consistent API types" or "The prompt that fixed our validation pattern." That's useful content and positions you as someone who vibecodes effectively.

### 4. Engage

Reply to comments. Ask for use cases. Credit ideas. Building in public is a loop: you share, others respond, you learn and share again.

### 5. Consistency over volume

One update per week is enough. Better to be steady than to burn out with daily posts.

---

## Mindset

You don't need to be perfect. Share the mess, the pivots, and the prompts that didn't work. In 2026, the vibecoders who stand out are the ones who ship often and share honestly. Your process is the product.

---

## What to avoid

- **Don't oversell.** "AI built this in 5 minutes" without context can mislead. "I used Cursor to scaffold this in 5 minutes, then spent 20 refining" is honest.
- **Don't share secrets or keys.** No API keys, no internal-only details. Share structure and learnings, not credentials.
- **Don't compare yourself to full teams.** You're one person (or a small team) with AI. Compare to your past self and your goals.

---

## Next steps

- **Vibecoding in 2026** – From idea to shipped so you have something to share.
- **Prompting for Code** – Better prompts → better output → more to show.
- **AI-Powered Development** – Tools and workflows that let you ship and share more.

You now have a clear picture: what to share (idea, progress, stack, blocks, launches), where (X, IH, blog, Vamp), and how (ship small, share stack, document workflows, engage). Start with one small ship and one post.

$_TUTBODY_$ WHERE id = '3418d216-0a56-4f1b-b239-ecf361a0dd5d'