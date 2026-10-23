# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Overview (overview)

**Impact:** MEDIUM  
**Description:** Specification scope, goals, and philosophy. Introduction to the
components.build standard for building modern UI components.

## 2. Principles (principles)

**Impact:** HIGH  
**Description:** Core design principles for component architecture including
composability, accessibility, customization, performance, transparency, and DX.

## 3. Definitions (definitions)

**Impact:** MEDIUM  
**Description:** Common terminology and component type definitions including
primitive, compound, headless, and styled components.

## 4. Composition (composition)

**Impact:** HIGH  
**Description:** Breaking down complex components into composable sub-components
using Root, Trigger, Content, and other naming patterns.

## 5. Accessibility (accessibility)

**Impact:** CRITICAL  
**Description:** Building accessible components with keyboard navigation, screen
reader support, ARIA attributes, and focus management.

## 6. State (state)

**Impact:** HIGH  
**Description:** Controlled and uncontrolled state through the existing shared
primitive APIs.

## 7. Types (types)

**Impact:** HIGH  
**Description:** TypeScript patterns for inheriting native host props/ref, deriving existing
shared-part props, and exporting clear contracts without changing host ownership.

## 8. Polymorphism (polymorphism)

**Impact:** MEDIUM  
**Description:** Using existing shared host/render APIs for interaction; generic `as`
illustrations remain background for justified passive content/layout wrappers.

## 9. Render Composition (as-child)

**Impact:** MEDIUM  
**Description:** Base UI render composition with preserved native semantics,
props and ref.

## 10. Data Attributes (data-attributes)

**Impact:** LOW  
**Description:** Reading existing Base UI state attributes and preserving stable data-slot
identities without duplicating state or overriding shared-control appearance.

## 11. Styling (styling)

**Impact:** HIGH  
**Description:** Component styling with Tailwind CSS, cn utility, class-variance-authority
(CVA), and intelligent class merging.

## 12. Design Tokens (design-tokens)

**Impact:** MEDIUM  
**Description:** CSS variables for theming, color schemes, and consistent design
system values across components.

## 13. Documentation (documentation)

**Impact:** MEDIUM  
**Description:** Documenting components with JSDoc, usage examples, accessibility
notes, and prop descriptions.

## 14. Registry (registry)

**Impact:** LOW  
**Description:** Component registry structure and schema for distributing
components via registries like shadcn/ui.

## 15. NPM (npm)

**Impact:** LOW  
**Description:** Publishing components to npm including package.json
configuration, exports, and module formats.

## 16. Marketplaces (marketplaces)

**Impact:** LOW  
**Description:** Distribution strategies for component marketplaces and
third-party component ecosystems.
