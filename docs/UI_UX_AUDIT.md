# NAS CodeWorks UI/UX audit and preservation map

Date: 2026-09-01

## Refactoring boundary

This refactor is limited to information architecture, visual hierarchy, grouping, responsive layout, and progressive disclosure. The following contracts are frozen:

- Worker routes, API contracts, R2 binding, authentication/authorization behavior, and content data shape.
- Existing element IDs, existing event handlers, section builders, save/publish/upload behavior, and preview messaging.
- Existing local/session storage keys and their values.
- Existing content fields, list operations, ordering, visibility, toggles, uploads, imports, exports, and destructive confirmations.

## Surface inventory

| Surface | Current purpose | Existing interactive areas | Refactor scope |
|---|---|---|---|
| `/` | Public marketing site | Navigation, mobile menu, capability tabs, IQD/USD switch, package/contact links, WhatsApp/email, mobile dock | Preserve all; improve hierarchy only where needed |
| `/admin/` | Current CMS | Gate, top actions, section navigation, content editors, preview, settings, uploads, publishing, partners, custom blocks | Primary refactor target |
| `/admin.html` | Legacy direct CMS route | Same core actions plus legacy partners loader | Preserve accessibility; no functional removal |
| `/docpdf/` | Document Studio | Header/footer/page/block tabs, add block, inspector, ordering, duplicate/delete, table rows/columns, print | Preserve as independent tool; responsive grouping only in a later isolated pass |
| `/v2/admin*` | Redirect compatibility | Redirects to `/admin/` | Frozen |

## CMS action map

| Element / option | Function | Current location | Importance | Classification | Proposed location |
|---|---|---|---|---|---|
| Save and publish | Save locally and publish existing content | Top bar | Critical | Primary | Persistent top-bar action |
| Site preview | Show/open current preview | Top bar + preview panel | High | Primary | Persistent top-bar action |
| Import JSON | Load existing content file | Top bar | Medium / occasional | Secondary | `More` menu, same button and handler |
| Export JSON | Download current content | Top bar | Medium / occasional | Secondary | `More` menu, same button and handler |
| Settings entry | Open existing settings editor | End of long sidebar | High for maintenance, low frequency | Secondary | Clear top-bar settings entry and sidebar system group |
| Save state indicator | Show ready/saving/saved/error | Top bar | High | Status | Persistent, compact top-bar status |
| Preview device | Toggle desktop/mobile preview | Preview header | Medium | Advanced contextual | Keep inside preview toolbar |
| Preview reload | Reload preview | Preview header | Medium | Advanced contextual | Keep inside preview toolbar |
| Preview open | Open preview in a new tab | Preview header | Medium | Advanced contextual | Keep inside preview toolbar |
| Preview close | Hide preview | Preview header | Medium | Advanced contextual | Keep inside preview toolbar |
| Preview resize | Change preview width and persist it | Divider | Low / advanced | Advanced contextual | Keep on divider, unchanged |
| Brand editor | Logo, favicon, wordmark | Sidebar: Identity | High | Primary navigation | `Core` navigation group |
| Hero editor | Main title, highlight, description, microcopy | Sidebar: Content | High | Primary navigation | `Core` navigation group |
| Services/prices | Services, features, prices and CTA | Sidebar: Content | High | Primary navigation | `Core` navigation group |
| Programs/images | Work samples, galleries, founder proof | Sidebar: Content | High | Primary navigation | `Core` navigation group |
| Contact editor | Phone, WhatsApp, email, location | Sidebar: Contact | High | Primary navigation | `Core` navigation group |
| Pain / before-after / offers | Supporting marketing sections | Sidebar: Content | Medium | Secondary | Collapsible `Content` group |
| Team / process / comparison / start / FAQ | Supporting content sections | Sidebar: Content | Medium | Secondary | Collapsible `Content` group |
| Footer | Footer copy | Sidebar: Contact | Low | Secondary | Collapsible `Site details` group |
| Settings | Password, reset, publish token | Sidebar: System | Low frequency / sensitive | Secondary | Collapsible `System` group + direct top entry |
| Section visibility | Show/hide existing public section | Hover controls on each content link | Medium | Advanced contextual | `Section controls` revealed on focus/hover or group expansion |
| Section ordering | Move existing public section up/down | Hover controls on each content link | Low / advanced | Advanced contextual | Same contextual controls, unchanged handlers |
| Repeated record accordion | Expand service/team/step/FAQ/etc. item | Editor sub-cards | High contextual | Progressive disclosure | Keep accordion; open first item only by default |
| Record reorder/delete | Move or delete current repeated record | Sub-card header | Medium / destructive | Advanced contextual | Keep in sub-card header; no handler changes |
| Add record | Add service/member/step/question/etc. | End of collection | High contextual | Primary contextual | Keep at end of relevant editor |
| Partner enable/content/items | Edit and publish strategic partners | Dynamically injected sidebar/editor | Medium | Secondary content | Content group; preserve dynamic loader and upload/publish paths |
| Custom text/divider/image/callout | Add custom block to current section | Fixed floating four-button toolbar | Low / advanced | Advanced | Collapsible `Advanced blocks` launcher; same button callbacks |
| Local gate password | Change local browser gate | Settings | Low / sensitive | Advanced settings | Settings → Security |
| Reset all content | Clear local edits and restore defaults | Settings | Rare / destructive | Advanced settings | Settings → Maintenance, confirmation unchanged |
| Upload/publish token | Save/clear/test token | Settings | Low / sensitive | Advanced settings | Settings → Publishing, storage key unchanged |

## Section editor preservation map

| Editor | Preserved fields and operations | New disclosure level |
|---|---|---|
| Brand | Logo mode/image/delete, wordmark prefix/suffix, favicon mode/image/delete | Primary section; field groups |
| Hero | Pill, three title parts, description, microcopy | Primary section; visible fields |
| Problems | Kicker/title/subtitle, cards, quotes, add/order/delete | Secondary section; item accordions |
| Before/after | Kicker/title/subtitle and all existing list items | Secondary section; item groups |
| Services | Kicker/title/subtitle, badge/icon/title/description/features/pricing/note/CTA, add/order/delete | Primary section; service accordions |
| Offers | Enable toggle, badge/title/body/WhatsApp | Secondary section |
| Proof/programs | Program copy, image galleries/uploads/order/delete, founder bio/avatar/stats | Primary section; contextual advanced controls |
| Team | Member photo/name/role/bio, upload/delete/add/order | Secondary section; member accordions |
| Process | Step title/body/timing, add/order/delete | Secondary section; step accordions |
| Comparison | Column labels, criterion rows, status/text per column, add/order/delete | Secondary section; row accordions |
| Start/promises | CTA copy/WhatsApp and promise title/subtitle, add/order/delete | Secondary section; promise accordions |
| FAQ | Kicker/title, question/answer, add/order/delete | Secondary section; question accordions |
| Contact | Phone display, WhatsApp number, email, location | Primary section |
| Footer | Tagline and lower-left/lower-right copy | Secondary details |
| Partners | Enable, kicker/title/subtitle, photo/name/role/bio/link, upload/delete/add/order | Secondary content; partner accordions |

## State and integration contracts

| Contract | Current key/path | Preservation rule |
|---|---|---|
| Content draft | `localStorage:nascw_content_v1` | No rename, reset, migration, or shape change |
| Admin password | `localStorage:nascw_admin_pass` | No behavior change |
| Gate session | `sessionStorage:nascw_admin_ok` | No behavior change |
| Publish/upload token | `localStorage:nascwAdminUploadToken` | No behavior change |
| Preview width | `localStorage:nascw_pv_w` | No behavior change |
| Document Studio state | `localStorage:nas_docpdf_clear_v4` | No behavior change |
| Content read/write | `GET/POST /api/content` | Frozen |
| Image upload | `POST /api/upload-image` | Frozen |
| Uploaded assets | `GET /uploads/*` | Frozen |
| Preview update | `postMessage: nascw-preview-content` | Frozen |

## Proposed information architecture

1. Persistent top bar: identity, save status, preview, save/publish.
2. `More` menu: import and export, using the original button nodes.
3. Clear settings entry: opens the existing settings builder.
4. Sidebar `Core`: brand, hero, services/prices, programs/images, contact.
5. Collapsible `Content`: every remaining content section, including dynamically loaded partners.
6. Collapsible `Site details`: footer.
7. Collapsible `System`: existing settings.
8. Inside editors: existing sub-card accordions and contextual controls; no duplicated stateful inputs.
9. Mobile: compact top bar plus a vertical navigation drawer/group model; no horizontal conveyor of all sections.

## Regression checklist

- Every original top-bar ID exists exactly once.
- Every section builder remains reachable.
- Every content field, toggle, upload, add, reorder, delete, and visibility action remains reachable.
- Import/export retain their original nodes and handlers.
- Preview device/reload/open/close/resize work and retain state.
- Gate and all storage keys remain unchanged.
- Save still writes locally and the existing extensions still publish.
- Partners editor remains dynamically injected and publishes/uploads through existing endpoints.
- Custom blocks retain all four types and their callbacks.
- No Worker/API/data/auth file is modified.
- Desktop, laptop, tablet, and mobile have no horizontal overflow or inaccessible menu.
- Public navigation, tabs, currency switch, links, WhatsApp, and mobile dock remain unchanged.
- Document Studio controls and saved document state remain unchanged.
