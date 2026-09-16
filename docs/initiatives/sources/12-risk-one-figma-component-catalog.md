# Risco 1 Figma And Component Catalog

## Source

- File: `SACNexus - Design`
- Page: `AI Screens` (`2179:2`)
- Section: `Risco 1` (`2241:774`)
- Desktop reference: `1440 × 900`
- Framework target: Vite, React 19, TypeScript, TanStack Router, Tailwind CSS
  v4, shadcn/Base UI.

## Screen Inventory

| Order | Figma node | Frame | Route/state |
| --- | --- | --- | --- |
| 05 | `2181:6` | Dashboard empty | `/dashboard`, no request |
| 06 | `2181:7` | New process | `/processes/new` |
| 07 | `2181:8` | AVCB request | `/processes/new/request` |
| 08 | `2181:9` | Establishment registration | `/processes/new/establishment` |
| 09 | `2181:10` | Classification questionnaire | `/processes/new/classification` |
| 10 | `2181:11` | Risco 1 result | `/processes/new/result` |
| 11 | `2181:12` | Review and declaration | `/processes/new/review` |
| 12 | `2181:13` | Automatic processing | `/processes/new/processing` |
| 13 | `2181:14` | Document issued | `/processes/:processId/completed` |
| 14 | `2181:15` | Dashboard completed | `/dashboard`, completed request |
| 15 | `2181:16` | Process details | `/processes/:processId` |

## Repeated Visual Grammar

- Fixed/collapsible contributor sidebar with company header, nested navigation,
  counters, and user footer.
- Main top bar with current area and user badge.
- Content canvas with title, description, optional state/step badge, cards, and
  trailing action group.
- Neutral cards with semantic status badges and purple primary actions.
- Desktop content padding of approximately `40px × 26px`, mapped to responsive
  Tailwind scale values instead of fixed page dimensions.
- Geist typography, Lucide icons, semantic background/border/foreground
  tokens, and a `240px` expanded sidebar.
- Measured desktop tokens: `24px/30px` page titles, `13px` supporting copy,
  `#fbfbfc` content canvas, `#e3e3e8` borders, `#403bad` primary actions,
  `#f2f2ff` selected/secondary surfaces, `6px` card/button radius, `40px`
  field height, `8px` field radius, and `12px` primary vertical rhythm.

## Component Decision Order

1. Existing shared component.
2. Official shadcn component or block.
3. Compatible community registry item.
4. Domain composition under `modules/processes`.
5. New shared primitive only after proven generic reuse.

## Primitive Catalog

| Need | Decision | Owner |
| --- | --- | --- |
| Application sidebar | Official `@shadcn/sidebar-07` architecture | shared primitives + process composition |
| Responsive mobile navigation | `Sidebar`, `Sheet`, `useMobile` from shadcn | shared |
| Nested navigation | `Collapsible`, `SidebarMenuSub` | shared |
| User menu | `Avatar`, `DropdownMenu` | shared |
| Page/content cards | Existing `Card` composition | shared |
| Empty dashboard | Existing `Empty` | shared |
| Buttons and links | Existing `Button`/`buttonVariants` | shared |
| Status and step labels | Existing `Badge` with domain variants | shared + processes |
| Text fields | Existing `Field`, `FieldGroup`, `Input` | shared |
| Questionnaire choices | Existing `FieldSet`, `FieldLegend`, `RadioGroup` | shared |
| Declaration | Existing `Checkbox` | shared |
| Questionnaire progress | Existing `Progress` | shared |
| Completed process list | Existing `Table` | shared |
| Loading placeholder | Existing `Skeleton`; icon motion for live process | shared |
| Separators | Existing `Separator` | shared |
| Feedback | Existing `Alert`; screen-reader live region | shared |

## Domain Composition Catalog

| Composition | Responsibility | Reuse |
| --- | --- | --- |
| `ContributorShell` | Sidebar provider, responsive sidebar, top bar, main landmark | all 11 screens |
| `ContributorSidebar` | Company identity, route-aware groups, counters, user menu | all 11 screens |
| `ProcessPage` | Title, description, badge slot, content, and actions | all process pages |
| `ProcessPageActions` | Responsive primary/secondary action alignment | steps 1–4 and result |
| `MetricCard` | Dashboard metric label and value | both dashboard states |
| `StatusBadge` variants | available, step, result, processing, completed, risk | multiple screens |
| `SummaryCard` | Full card composition for titled read-only sections | request, result, review, details |
| `SummaryList` | Label/value pairs with responsive columns | review and details |
| `QuestionCard` | Semantic question fieldset and yes/no radio group | questionnaire |
| `ProcessStatusList` | Live automatic-processing steps | processing |
| `DocumentSummary` | Document identity and copy/download actions | issued and details |
| `RecentProcessesTable` | Completed dashboard process row and actions | completed dashboard |

## State Catalog

```txt
idle
  -> request-selected
  -> request-confirmed
  -> establishment-completed
  -> questionnaire-completed
  -> classified
  -> declaration-accepted
  -> processing
  -> completed
```

The provider exposes:

- `state`: selected company, current draft fields/answers/process, phase, and
  completed process snapshots.
- `actions`: start, confirm request, save establishment, answer, classify,
  accept declaration, start processing, complete, reset.
- `meta`: derived counts, classification, current process, completed process
  collection, and processing status.

Starting a process clears the selected company, every user-editable field, and
every questionnaire answer. The contributor must select a company owned by
`modules/companies` before continuing. Completing a process appends an
immutable presentation snapshot. Starting another draft does not replace
earlier completed snapshots.

The UI depends on this interface, not on `useState`, storage, or a future API
implementation.

## Responsive And Accessibility Notes

- Keep the expanded desktop sidebar at the Figma width and use the official
  off-canvas sheet behavior below the desktop breakpoint.
- Allow content cards and action groups to stack; contain tables in horizontal
  overflow without causing page-level overflow.
- Use one `h1` per page and semantic `main`, `nav`, `header`, `form`,
  `fieldset`, `legend`, `table`, `dl`, and status landmarks.
- Maintain visible focus and route-aware `aria-current`.
- Announce processing progress through a polite live region and avoid repeating
  animation under reduced-motion preferences.
- Keep button labels stable while disabled/loading and block duplicate issue
  actions.

## Deferred Components

- A production PDF viewer/generator, public validation result, paginated
  process data table, and server-backed activity timeline are deliberately not
  generalized in this initiative.
