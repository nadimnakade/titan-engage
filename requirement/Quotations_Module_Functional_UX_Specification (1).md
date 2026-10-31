# Quotations Module — Functional & UX Specification

**Version:** 1.0  
**Date:** 31 October 2026  
**Scope:** Quotations only (no supplier purchasing or invoice-module redesign)

## 1. Objective and guiding principles

Build a universal, industry-agnostic Quotations module where businesses can create, edit, manage, archive, export and email quotations. The most important requirement is **a configurable field and template engine** that supports any product or service without developer changes.

- Enter information once, reuse it in the quote preview, PDF, email attachment and quote-to-invoice handoff.
- Use the existing application's design language, customer records, inventory and invoicing capability where available.
- Keep **business status**, **record visibility**, **invoice conversion** and **email delivery** as separate concepts.
- Custom product configuration must not depend on one specific trade such as blinds, automotive or furniture.
- Preserve historical quotations even after templates, settings or inventory items change.

## 2. Quotations listing and filters

The default Quotations page displays non-deleted, non-archived records with Active quotations easy to identify.

| Column | Description |
|---|---|
| Quote number | Unique, clickable reference |
| Customer | Customer or business name |
| Created | Quotation date |
| Valid until | Optional expiry date |
| Total | Amount and currency |
| Status | Active, Closed or Rejected (or converted indicator) |
| Invoice | Linked invoice reference if converted |
| Email | Not sent, Sent or Failed |
| Actions | View, Edit, Duplicate, Preview, PDF, Email, Convert, Archive, Delete |

**Filtering and views:**

- Search by quotation number, customer name, and relevant product description.
- Status: All / Active / Closed / Rejected.
- Invoice conversion: All / Converted / Not converted.
- Email: All / Sent / Not sent / Failed.
- Date range (created, valid-until); customer; min/max value.
- Clearly accessible views: All Quotes, Active, Closed, Rejected, Archived and Trash. Archive/Trash are not included in normal working results.
- Permit simultaneous filters, sorting, clear/reset action, result counts and pagination.
- Support multi-select and permission-checked bulk Archive, Restore, Soft Delete and Restore from Trash actions; bulk PDF export where practical.

## 3. Universal custom fields and templates (mandatory)

### 3.1 Custom-field administration

Under **Settings → Quotations → Custom Fields & Templates**, administrators can create and reuse field definitions without a developer or database schema change.

- Create, rename, describe, duplicate, enable/disable and reorder fields.
- Set type, default, optional/required, validation, choice options and allowed free-text entries.
- Group fields into sections and configure conditional show/hide and requiredness rules.
- Assign field sets at business, product-category, individual-product or one-off quote-item level.
- Define whether each field appears on customer PDFs; preview and publish templates.
- Retain field definitions and values as versioned/snapshotted structured data for historical document integrity.

### 3.2 Supported input types

| Input type | Example |
|---|---|
| Short text / long text | Model / special instructions |
| Integer / decimal | Pieces / thickness |
| Measurement / dimensions + units | Width, height, depth in mm, cm, m or inches |
| Dropdown (optional custom entry) | Product type, material |
| Multi-select | Accessories |
| Radio group | Manual / Motorised |
| Checkbox / yes-no | Installation included |
| Colour | Colour name and/or code |
| Date | Required delivery date |

New types should be extensible. Field validation and conditional visibility must work in fill-up mode and before export/send.

### 3.3 Window blinds example (illustrative, not hardcoded)

| Field | Behaviour |
|---|---|
| Blind type | Inventory dropdown or freehand |
| Model | Inventory dropdown or freehand comment |
| Dimensions | Width and height, with configurable unit |
| Mechanism | Manual / Motorised |
| Opening direction | Up / Down / Full Left / Full Right / Split Middle |
| Operating string location | Left / Right / Both / N/A |
| Quantity | Positive whole number |
| Colour | Preset colour or freehand description/code |

Other template examples: automotive parts (make, model, year, part number, side), furniture (material, size, finish), custom services (location, duration, frequency). These are examples of the same universal engine.

## 4. Quotation fill-up / create and edit

**Quotation header:** automatically generated quote reference, customer, quote date, optional expiry, currency, customer reference and notes/terms.

**Item workflow:** add from inventory or enter a freehand product/service; select or infer a template; fill in dynamic custom attributes; enter quantity, unit price, discount; duplicate, reorder or remove items; add further items.

- Each line item keeps its own product configuration, even for repeated products.
- Only applicable fields are shown; conditional fields update when controlling values change.
- Label required fields, show clear validation errors and retain unsaved form state while navigating the editor.
- Show live subtotal, discounts, VAT/tax and total.
- Primary actions: Save, Preview, Export PDF, Send Email, Convert to Invoice (when eligible).
- Responsive desktop/tablet/mobile layouts; large configurations may use collapsible sections.

## 5. VAT and tax handling

- Configure applicable rate and support tax-inclusive or tax-exclusive pricing.
- Offer a **Show VAT/tax breakdown on quote** setting separately from tax calculation.
- Recalculate subtotal, discount, tax and total when inputs change.
- Persist treatment in quote, preview, PDF and invoice conversion payload.
- Hiding a tax line must never silently stop legally required tax calculation or conceal legally mandatory document information.

## 6. Quotation lifecycle and conversion

New quotes default to **Active**. For quotes not converted into invoices, users can manually set **Active**, **Closed** (not pursued) or **Rejected** (customer declined), and reopen as appropriate.

Conversion is a **separate system-managed indicator**, not an extra manually selected status. On conversion, remove the quote from outstanding Active views, show the new invoice reference and maintain the original quote. The invoice handoff carries customer, lines, quantities, prices, discounts, tax settings and structured custom attributes. Prevent accidental duplicate conversions and reuse the existing invoice workflow rather than redesigning it.

## 7. Archive, soft-delete and restoration

**Archive** hides a quote from standard working lists but retains its underlying business status, line items, PDFs, source links and conversion history. Archived quotes appear in an Archived view and may be restored by authorised users.

**Soft Delete** marks a quote as deleted without permanently erasing the record. It disappears from normal and Archived lists and appears in Trash; record deletion actor/time, retain quote number and relationships, and allow authorised recovery.

- Show confirmation before deletion and permission-check destructive actions.
- Restoring from Trash preserves whether the quote was archived before deletion; unarchive separately if desired.
- Do not reuse deleted quote numbers or permanently delete records automatically.
- Do not allow a trashed quote to be emailed or converted until restored.
- Converted/invoice-linked quotes retain their audit trail and financial references; permanent deletion would require a separately defined retention and permissions policy.
- Keep lifecycle status (Active/Closed/Rejected), record visibility (Normal/Archived/Trash), conversion and email delivery independent.

## 8. PDF preview and export

Provide a consistent on-screen **Preview** and **Export PDF** action. Output includes company branding/contact details, customer, quote number/dates, product/service lines, user-selected customer-visible custom fields, quantities, prices, discounts, applicable taxes, totals and terms/notes.

- Render long custom specifications and multiple pages professionally.
- Suppress blank optional attributes; preserve labels and units.
- Export the latest saved version; preview and emailed attachment should follow the same template.
- Support PDF download and printing.

## 9. Email configuration and sending

Under **Settings → Quotations → Email Configuration**, provide sender display name, sender/reply-to addresses, signature, default subject and message templates, and secure provider configuration. Credentials must not appear in client-side code.

In **Send Email**, prefill the customer's email where available and draft the subject/message with the quote reference, attach the generated PDF, and permit editing recipient, subject and body before sending. Show success/failure; support resend; log time, recipient, subject and sending outcome. Sent does **not** imply read or accepted.

## 10. Suggested quotation settings navigation

- General: numbering, defaults, validity and permitted currency.
- Custom Fields: field definitions, validation, ordering and visibility.
- Product Templates: reusable category/product-specific configurations.
- VAT / Tax: rates, inclusive/exclusive and document display.
- PDF / Branding: header, logo, business details and customer-visible attributes.
- Email: sender identity, templates, service configuration.

Respect administrator permissions. Settings changes must not retroactively mutate old document values.

## 11. User interface wireframes and intended flows

The accompanying **conceptual wireframe** depicts the Quotations List, Quote Detail, Item Fill-up Form, Field Builder Settings, PDF Preview, Send Email dialog, status actions and Archived view. It is a visual example, not a pixel-perfect design; follow the current platform design system.

**Flow A — List:** Open Quotations → search/filter → open quote → act via row menu or bulk selection. Archived/Trash are separate views with restore.

**Flow B — Fill-up:** New Quote → select customer → add inventory/freehand item → select template → complete dynamic fields → quantity/price/tax → save/preview.

**Flow C — Settings:** Settings → Custom Fields → create field / assign template → configure requiredness, conditions and PDF visibility → preview → save.

**Flow D — Share:** Open saved quote → Preview → Export PDF or Send Email → compose email and attach PDF → log result. Convert to invoice via the existing workflow.

**Important:** The status mock-up uses a simplified badge for Archived. In the implementation, Archived is a *visibility state* and must remain separate from Active/Closed/Rejected, exactly as defined above.

## 12. Permissions and audit

- Use existing business-level permission roles; only authorised administrators alter shared templates and email settings.
- Allow role-based Archive, Restore, Soft Delete and invoice conversion.
- Track creator/last editor, status changes, archive/restore/delete actions, email events and conversion references.
- Maintain original quote document identity and immutable source references across restores and conversion.

## 13. Acceptance criteria

- [ ] An administrator can create a new industry-specific product template with no code/schema change.
- [ ] All supported custom fields, conditions, validations and PDF visibility settings work.
- [ ] Inventory and freehand items can be added with independent configurations.
- [ ] Historical quote values survive later template changes.
- [ ] Active is the default; Closed and Rejected may be set for non-converted quotes.
- [ ] Converted quotes display a linked invoice and are not outstanding Active quotes.
- [ ] List filters can be combined and normal/Archived/Trash views are distinct.
- [ ] Bulk actions, Archive, Soft Delete and Restore respect permissions and retain data.
- [ ] Tax calculations and document display controls are separate.
- [ ] PDF preview, export and customer-visible field selection work on multi-page quotes.
- [ ] Configured email sender/templates and direct quote emailing work with logged results.
- [ ] Quote-to-invoice passes all relevant customer, line, tax and custom-field data.
- [ ] Existing invoice functionality is reused without redesign.
- [ ] The UX is responsive and follows existing platform conventions.

## 14. Explicitly out of scope

Supplier orders, purchasing queues, supplier consolidation, procurement, goods receipts, payment collection and redesigning the invoice module. The only invoice-related requirement here is the quotation's **Convert to Invoice** action and data handoff.

## Expected outcome

A reusable Quotations module adaptable to any business, with structured product specifications, complete status/visibility management, strong filters, easy fill-up, controlled document output and direct customer communication.
