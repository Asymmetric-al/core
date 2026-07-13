# Payload CMS Field Reference for AI-Assisted Migration

This document helps AI assistants analyze source CMS data and generate appropriate Payload collection configurations. When given sample data from a source CMS, use this reference to determine the correct Payload field types.

## How to Use This Document

1. Analyze the source data structure (JSON, API response, or database schema)
2. For each field, determine the data type and pattern
3. Match to the appropriate Payload field type below
4. Generate a Payload collection config

---

## Field Type Schemas

Every field shares these **base properties**:

```typescript
type BaseField = {
  name: string                    // Required. Field identifier (camelCase)
  label?: string                  // Admin UI label. Defaults to name
  required?: boolean              // Validation. Default: false
  unique?: boolean                // Database unique constraint
  index?: boolean                 // Database index for faster queries
  localized?: boolean             // Enable per-locale values
  hidden?: boolean                // Hide from admin UI
  saveToJWT?: boolean             // Include in auth JWT
  defaultValue?: unknown          // Default when creating new docs
  validate?: Function             // Custom validation function
  access?: {                      // Field-level access control
    create?: Function
    read?: Function
    update?: Function
  }
  hooks?: {                       // Field lifecycle hooks
    beforeValidate?: Function[]
    beforeChange?: Function[]
    afterChange?: Function[]
    afterRead?: Function[]
  }
  admin?: {
    condition?: Function          // Conditionally show/hide field
    description?: string          // Help text below field
    position?: 'sidebar'          // Move to sidebar in admin
    width?: string                // CSS width (e.g., '50%')
    style?: CSSProperties         // Inline styles
    className?: string            // CSS class
    readOnly?: boolean            // Disable editing
    disabled?: boolean            // Disable field entirely
    hidden?: boolean              // Hide in admin
    components?: {                // Custom React components
      Field?: Component
      Cell?: Component
      Filter?: Component
    }
  }
}
```

---

## Field Types

### text

Single-line text input.

**Full schema:**
```typescript
type TextField = BaseField & {
  type: 'text'
  minLength?: number              // Minimum character count
  maxLength?: number              // Maximum character count
  hasMany?: boolean               // Allow multiple values (array of strings)
  minRows?: number                // Min items when hasMany: true
  maxRows?: number                // Max items when hasMany: true
  admin?: BaseField['admin'] & {
    placeholder?: string          // Placeholder text
    autoComplete?: string         // HTML autocomplete attribute
    rtl?: boolean                 // Right-to-left text
  }
}
```

**Use when:**
- Short strings (titles, names, slugs, URLs)
- Data is typically < 200 characters
- No line breaks expected

**Source patterns:**
```json
{ "title": "Hello World" }
{ "slug": "hello-world" }
{ "url": "https://example.com" }
{ "sku": "PROD-12345" }
```

**Payload config examples:**
```typescript
{ name: 'title', type: 'text', required: true }
{ name: 'slug', type: 'text', unique: true, index: true }
{ name: 'tags', type: 'text', hasMany: true, maxRows: 10 }
{ name: 'sku', type: 'text', minLength: 5, maxLength: 20 }
```

---

### textarea

Multi-line text without formatting.

**Full schema:**
```typescript
type TextareaField = BaseField & {
  type: 'textarea'
  minLength?: number              // Minimum character count
  maxLength?: number              // Maximum character count
  admin?: BaseField['admin'] & {
    placeholder?: string          // Placeholder text
    rows?: number                 // Visible rows (height)
    rtl?: boolean                 // Right-to-left text
  }
}
```

**Use when:**
- Longer text content without HTML/rich formatting
- Descriptions, excerpts, plain summaries
- Data contains line breaks but no markup

**Source patterns:**
```json
{ "description": "A longer description\nthat spans multiple lines" }
{ "excerpt": "Brief summary of the content..." }
{ "bio": "Author biography text here" }
```

**Payload config examples:**
```typescript
{ name: 'description', type: 'textarea' }
{ name: 'excerpt', type: 'textarea', maxLength: 500 }
{ name: 'bio', type: 'textarea', admin: { rows: 6 } }
```

---

### richText

Rich text editor (Lexical by default, or Slate).

**Full schema:**
```typescript
type RichTextField = BaseField & {
  type: 'richText'
  editor?: LexicalEditorConfig     // Lexical editor configuration
  // Lexical-specific options (via editor config):
  // - features: Enable/disable toolbar features
  // - lexical: Raw Lexical configuration
  admin?: BaseField['admin'] & {
    hideGutter?: boolean           // Hide left gutter
    elements?: string[]            // Deprecated (Slate). Use editor.features
    leaves?: string[]              // Deprecated (Slate). Use editor.features
  }
}
```

**Use when:**
- HTML content from WYSIWYG editors
- Markdown content (will need conversion)
- Content with formatting (bold, italic, links, headings)
- Content blocks from Contentful, Sanity, etc.

**Source patterns:**
```json
{ "content": "<p>Hello <strong>world</strong></p>" }
{ "body": "# Heading\n\nParagraph with **bold**" }
{ "content": { "nodeType": "document", "content": [...] } }
```

**Payload config examples:**
```typescript
{ name: 'content', type: 'richText' }
{ name: 'body', type: 'richText', required: true }
```

**Migration notes:**
- WordPress `content.rendered` can be imported as HTML
- Contentful Rich Text requires conversion to Lexical format
- Markdown should be converted to HTML first, or use Lexical markdown plugin
- Data stored as Lexical JSON, not HTML

---

### number

Numeric values (integers or decimals).

**Full schema:**
```typescript
type NumberField = BaseField & {
  type: 'number'
  min?: number                    // Minimum value
  max?: number                    // Maximum value
  hasMany?: boolean               // Allow multiple values (array of numbers)
  minRows?: number                // Min items when hasMany: true
  maxRows?: number                // Max items when hasMany: true
  admin?: BaseField['admin'] & {
    placeholder?: string          // Placeholder text
    autoComplete?: string         // HTML autocomplete attribute
    step?: number                 // Increment step (e.g., 0.01 for currency)
  }
}
```

**Use when:**
- Prices, quantities, counts
- Ratings, scores
- Any numeric data

**Source patterns:**
```json
{ "price": 29.99 }
{ "quantity": 5 }
{ "rating": 4.5 }
{ "views": 1000 }
```

**Payload config examples:**
```typescript
{ name: 'price', type: 'number', min: 0, admin: { step: 0.01 } }
{ name: 'quantity', type: 'number', min: 0, max: 1000 }
{ name: 'rating', type: 'number', min: 0, max: 5 }
{ name: 'scores', type: 'number', hasMany: true }
```

---

### email

Email address field with built-in validation.

**Full schema:**
```typescript
type EmailField = BaseField & {
  type: 'email'
  minLength?: number              // Minimum character count
  maxLength?: number              // Maximum character count
  admin?: BaseField['admin'] & {
    placeholder?: string          // Placeholder text
    autoComplete?: string         // HTML autocomplete attribute
  }
}
```

**Use when:**
- Field contains email addresses
- Field name suggests email (email, contactEmail, etc.)

**Source patterns:**
```json
{ "email": "user@example.com" }
{ "contactEmail": "support@company.com" }
```

**Payload config examples:**
```typescript
{ name: 'email', type: 'email', required: true }
{ name: 'contactEmail', type: 'email', admin: { placeholder: 'you@example.com' } }
```

---

### date

Date/datetime picker.

**Full schema:**
```typescript
type DateField = BaseField & {
  type: 'date'
  admin?: BaseField['admin'] & {
    placeholder?: string          // Placeholder text
    date?: {
      displayFormat?: string      // Display format (e.g., 'MMM d, yyyy')
      pickerAppearance?: 'dayOnly' | 'dayAndTime' | 'monthOnly' | 'timeOnly'
      minDate?: Date              // Earliest selectable date
      maxDate?: Date              // Latest selectable date
    }
  }
}
```

**Use when:**
- ISO date strings
- Timestamps
- Any date/time values

**Source patterns:**
```json
{ "publishedAt": "2024-01-15T10:30:00Z" }
{ "createdAt": "2024-01-15" }
{ "eventDate": 1705312200000 }
```

**Payload config examples:**
```typescript
{ name: 'publishedAt', type: 'date' }
{ name: 'eventDate', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } }
{ name: 'birthDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } }
```

**Migration notes:**
- Payload stores dates as ISO strings
- Unix timestamps should be converted: `new Date(timestamp).toISOString()`

---

### checkbox

Boolean true/false toggle.

**Full schema:**
```typescript
type CheckboxField = BaseField & {
  type: 'checkbox'
  defaultValue?: boolean          // Default checked state
  admin?: BaseField['admin']      // No additional checkbox-specific admin options
}
```

**Use when:**
- Boolean values
- Yes/no flags
- Feature toggles

**Source patterns:**
```json
{ "featured": true }
{ "isPublished": false }
{ "allowComments": true }
```

**Payload config examples:**
```typescript
{ name: 'featured', type: 'checkbox', defaultValue: false }
{ name: 'isPublished', type: 'checkbox' }
{ name: 'allowComments', type: 'checkbox', defaultValue: true }
```

---

### select

Dropdown with predefined options.

**Full schema:**
```typescript
type SelectField = BaseField & {
  type: 'select'
  options: Array<                 // Required. List of options
    | string                      // Simple: just the value (label = value)
    | { label: string; value: string }  // Full: separate label and value
  >
  hasMany?: boolean               // Allow multiple selections
  defaultValue?: string | string[] // Default selected value(s)
  admin?: BaseField['admin'] & {
    isClearable?: boolean         // Allow clearing selection
    isSortable?: boolean          // Allow drag-to-reorder when hasMany
  }
}
```

**Use when:**
- Enum values
- Status fields
- Category/type with fixed options
- Field has limited set of valid values

**Source patterns:**
```json
{ "status": "published" }
{ "priority": "high" }
{ "type": "article" }
{ "tags": ["featured", "trending"] }
```

**Payload config examples:**
```typescript
// Simple options (value = label)
{ name: 'priority', type: 'select', options: ['low', 'medium', 'high'] }

// Full options
{
  name: 'status',
  type: 'select',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ],
  defaultValue: 'draft',
}

// Multiple selection
{
  name: 'tags',
  type: 'select',
  hasMany: true,
  options: [
    { label: 'Featured', value: 'featured' },
    { label: 'Trending', value: 'trending' },
    { label: 'New', value: 'new' },
  ],
}
```

**Detecting options from data:**
If you see the same field with different values across records, collect unique values to build options:
```json
// Record 1: { "status": "draft" }
// Record 2: { "status": "published" }
// Record 3: { "status": "published" }
// options: draft, published
```

---

### radio

Radio button group (single selection, always visible).

**Full schema:**
```typescript
type RadioField = BaseField & {
  type: 'radio'
  options: Array<                 // Required. List of options
    | string                      // Simple: just the value
    | { label: string; value: string }  // Full: separate label and value
  >
  defaultValue?: string           // Default selected value
  admin?: BaseField['admin'] & {
    layout?: 'horizontal' | 'vertical'  // Button arrangement
  }
}
```

**Use when:**
- Same as select, but fewer options (2-4)
- User should see all options at once

**Payload config examples:**
```typescript
{
  name: 'size',
  type: 'radio',
  options: [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
  ],
  defaultValue: 'md',
}

{
  name: 'alignment',
  type: 'radio',
  options: ['left', 'center', 'right'],
  admin: { layout: 'horizontal' },
}
```

---

### relationship

Reference to another document.

**Full schema:**
```typescript
type RelationshipField = BaseField & {
  type: 'relationship'
  relationTo: string | string[]   // Required. Target collection slug(s)
  hasMany?: boolean               // Allow multiple selections
  minRows?: number                // Min items when hasMany: true
  maxRows?: number                // Max items when hasMany: true
  filterOptions?:                 // Limit selectable documents
    | Where                       // Static where query
    | ((args: FilterOptionsProps) => Where | boolean)  // Dynamic filter
  admin?: BaseField['admin'] & {
    isSortable?: boolean          // Allow drag-to-reorder when hasMany
    allowCreate?: boolean         // Allow creating new docs from field (default: true)
    allowEdit?: boolean           // Allow editing related doc inline
  }
}

// When relationTo is an array (polymorphic), stored value shape is:
// { relationTo: 'collectionSlug', value: 'documentId' }

// When relationTo is a string, stored value is just the ID:
// 'documentId'
```

**Use when:**
- Foreign key / ID reference to another collection
- Nested object that should be a separate document
- Author, category, tag references

**Source patterns:**
```json
// ID reference
{ "author": 123 }
{ "authorId": "user_abc123" }

// Object with ID
{ "author": { "id": 123, "name": "John" } }

// Contentful link
{ "author": { "sys": { "id": "abc123", "linkType": "Entry" } } }

// Array of references
{ "categories": [1, 2, 3] }
{ "tags": [{ "id": 1 }, { "id": 2 }] }
```

**Payload config examples:**
```typescript
// Single relationship
{ name: 'author', type: 'relationship', relationTo: 'users' }

// Multiple relationships (hasMany)
{ name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true }

// Polymorphic (multiple collection types)
{
  name: 'relatedContent',
  type: 'relationship',
  relationTo: ['posts', 'pages', 'products'],
  hasMany: true,
}

// With filter (only show published posts)
{
  name: 'featuredPost',
  type: 'relationship',
  relationTo: 'posts',
  filterOptions: {
    status: { equals: 'published' },
  },
}
```

---

### upload

File/media upload field. References a document in an upload-enabled collection.

**Full schema:**
```typescript
type UploadField = BaseField & {
  type: 'upload'
  relationTo: string              // Required. Upload collection slug (e.g., 'media')
  hasMany?: boolean               // Allow multiple files
  minRows?: number                // Min items when hasMany: true
  maxRows?: number                // Max items when hasMany: true
  filterOptions?:                 // Limit selectable files
    | Where
    | ((args: FilterOptionsProps) => Where | boolean)
  admin?: BaseField['admin'] & {
    isSortable?: boolean          // Allow drag-to-reorder when hasMany
  }
}

// Stored value is the upload document ID (or array of IDs when hasMany)
```

**Use when:**
- Image URLs or references
- File attachments
- Media library references

**Source patterns:**
```json
// URL reference
{ "featuredImage": "https://example.com/image.jpg" }

// WordPress media ID
{ "featured_media": 456 }

// Object with URL
{ "image": { "url": "https://...", "alt": "Description" } }

// Contentful asset
{ "image": { "sys": { "linkType": "Asset" }, "fields": { "file": { "url": "//images.ctfassets.net/..." } } } }

// Multiple images
{ "gallery": ["https://...", "https://..."] }
```

**Payload config examples:**
```typescript
{ name: 'featuredImage', type: 'upload', relationTo: 'media' }
{ name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true, maxRows: 10 }
{ name: 'document', type: 'upload', relationTo: 'documents' }
```

**Migration notes:**
- Download remote images and upload to Payload
- Store the new Payload media ID in the field
- Preserve alt text as a separate field on the media collection or via a group

---

### array

Repeatable group of fields.

**Full schema:**
```typescript
type ArrayField = BaseField & {
  type: 'array'
  fields: Field[]                 // Required. Sub-fields for each row
  minRows?: number                // Minimum number of rows
  maxRows?: number                // Maximum number of rows
  labels?: {                      // Custom row labels
    singular?: string
    plural?: string
  }
  admin?: BaseField['admin'] & {
    initCollapsed?: boolean       // Start rows collapsed
    isSortable?: boolean          // Allow drag-to-reorder (default: true)
    components?: {
      RowLabel?: Component        // Custom row label component
    }
  }
  // Each row automatically gets an 'id' field
}

// Stored as array of objects:
// [{ id: 'abc', field1: 'value', field2: 'value' }, ...]
```

**Use when:**
- Array of objects with consistent structure
- Repeater fields (ACF, etc.)
- List of items with multiple properties each

**Source patterns:**
```json
{
  "socialLinks": [
    { "platform": "twitter", "url": "https://twitter.com/..." },
    { "platform": "github", "url": "https://github.com/..." }
  ]
}

{
  "features": [
    { "title": "Feature 1", "description": "..." },
    { "title": "Feature 2", "description": "..." }
  ]
}
```

**Payload config examples:**
```typescript
{
  name: 'socialLinks',
  type: 'array',
  labels: { singular: 'Link', plural: 'Links' },
  minRows: 1,
  maxRows: 5,
  fields: [
    {
      name: 'platform',
      type: 'select',
      options: ['twitter', 'github', 'linkedin'],
      required: true,
    },
    { name: 'url', type: 'text', required: true },
  ],
}

{
  name: 'features',
  type: 'array',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'icon', type: 'upload', relationTo: 'media' },
  ],
}
```

---

### group

Nested object (non-repeating).

**Full schema:**
```typescript
type GroupField = BaseField & {
  type: 'group'
  fields: Field[]                 // Required. Sub-fields
  admin?: BaseField['admin'] & {
    hideGutter?: boolean          // Remove left border/gutter
  }
}

// Stored as nested object:
// { field1: 'value', field2: 'value' }
```

**Use when:**
- Nested object that's always singular
- Organizational grouping of related fields
- SEO metadata, address blocks, etc.

**Source patterns:**
```json
{
  "seo": {
    "title": "Page Title",
    "description": "Meta description",
    "keywords": ["a", "b"]
  }
}

{
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "zip": "12345"
  }
}
```

**Payload config examples:**
```typescript
{
  name: 'seo',
  type: 'group',
  label: 'SEO Settings',
  fields: [
    { name: 'title', type: 'text', maxLength: 60 },
    { name: 'description', type: 'textarea', maxLength: 160 },
    { name: 'keywords', type: 'text', hasMany: true },
  ],
}

{
  name: 'address',
  type: 'group',
  fields: [
    { name: 'street', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'state', type: 'text' },
    { name: 'zip', type: 'text' },
    { name: 'country', type: 'select', options: ['US', 'CA', 'UK'] },
  ],
}
```

---

### blocks

Flexible content / page builder blocks.

**Full schema:**
```typescript
type BlocksField = BaseField & {
  type: 'blocks'
  blocks: Block[]                 // Required. Available block types
  minRows?: number                // Minimum number of blocks
  maxRows?: number                // Maximum number of blocks
  admin?: BaseField['admin'] & {
    initCollapsed?: boolean       // Start blocks collapsed
    isSortable?: boolean          // Allow drag-to-reorder (default: true)
  }
}

type Block = {
  slug: string                    // Required. Unique block identifier
  labels?: {                      // Custom labels
    singular?: string
    plural?: string
  }
  fields: Field[]                 // Required. Fields in this block
  imageURL?: string               // Preview image URL
  imageAltText?: string           // Alt text for preview
  admin?: {
    components?: {
      Label?: Component           // Custom block label
    }
  }
}

// Stored as array with blockType identifier:
// [
//   { id: 'abc', blockType: 'hero', title: 'Welcome' },
//   { id: 'def', blockType: 'textBlock', content: {...} }
// ]
```

**Use when:**
- Dynamic content zones
- Page builder layouts
- ACF Flexible Content
- Contentful/Sanity block content

**Source patterns:**
```json
{
  "layout": [
    { "type": "hero", "title": "Welcome", "image": "..." },
    { "type": "textBlock", "content": "<p>...</p>" },
    { "type": "gallery", "images": [...] }
  ]
}
```

**Payload config examples:**
```typescript
{
  name: 'layout',
  type: 'blocks',
  minRows: 1,
  blocks: [
    {
      slug: 'hero',
      labels: { singular: 'Hero Section', plural: 'Hero Sections' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'text' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'cta',
          type: 'group',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'url', type: 'text' },
          ],
        },
      ],
    },
    {
      slug: 'textBlock',
      labels: { singular: 'Text Block', plural: 'Text Blocks' },
      fields: [
        { name: 'content', type: 'richText', required: true },
      ],
    },
    {
      slug: 'gallery',
      fields: [
        { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
        { name: 'columns', type: 'select', options: ['2', '3', '4'] },
      ],
    },
  ],
}
```

**Migration notes:**
- Map source block `type` field to Payload `blockType`
- Each block type needs its own field definitions

---

### json

Arbitrary JSON data.

**Full schema:**
```typescript
type JSONField = BaseField & {
  type: 'json'
  jsonSchema?: JSONSchema         // Optional JSON Schema for validation
  admin?: BaseField['admin'] & {
    editorOptions?: object        // Monaco editor options
  }
}

// Stored as-is (any valid JSON)
```

**Use when:**
- Unstructured or highly variable data
- Third-party API responses to store
- Data that doesn't fit other types
- Temporary/flexible storage during migration

**Source patterns:**
```json
{ "metadata": { "arbitrary": "data", "nested": { "values": true } } }
{ "apiResponse": { ... } }
{ "config": { "settings": [...] } }
```

**Payload config examples:**
```typescript
{ name: 'metadata', type: 'json' }

// With JSON Schema validation
{
  name: 'settings',
  type: 'json',
  jsonSchema: {
    type: 'object',
    properties: {
      theme: { type: 'string' },
      notifications: { type: 'boolean' },
    },
  },
}
```

**Migration notes:**
- Use as fallback when data structure is unknown or highly variable
- Consider converting to proper fields later for better querying

---

### point

Geographic coordinates (longitude, latitude).

**Full schema:**
```typescript
type PointField = BaseField & {
  type: 'point'
  admin?: BaseField['admin']      // No additional point-specific admin options
}

// Stored as GeoJSON Point:
// [longitude, latitude]  // Note: longitude first!
// e.g., [-74.0060, 40.7128] for New York City
```

**Use when:**
- Latitude/longitude pairs
- Map locations
- Geolocation data

**Source patterns:**
```json
{ "location": { "lat": 40.7128, "lng": -74.0060 } }
{ "coordinates": [40.7128, -74.0060] }
{ "geo": { "latitude": 40.7128, "longitude": -74.0060 } }
```

**Payload config examples:**
```typescript
{ name: 'location', type: 'point' }
{ name: 'coordinates', type: 'point', required: true }
```

**Migration notes:**
- Payload uses GeoJSON format: `[longitude, latitude]`
- Many sources use `[latitude, longitude]` - swap if needed!
- Convert from `{ lat, lng }` objects to `[lng, lat]` array

---

### row (Layout)

Horizontal layout for placing fields side-by-side.

**Full schema:**
```typescript
type RowField = {
  type: 'row'
  fields: Field[]                 // Required. Fields to display in row
  admin?: {
    condition?: Function          // Conditionally show/hide
  }
}
// No name required - purely layout
```

**Payload config example:**
```typescript
{
  type: 'row',
  fields: [
    { name: 'firstName', type: 'text', admin: { width: '50%' } },
    { name: 'lastName', type: 'text', admin: { width: '50%' } },
  ],
}
```

---

### collapsible (Layout)

Collapsible section for grouping fields.

**Full schema:**
```typescript
type CollapsibleField = {
  type: 'collapsible'
  label: string | Function        // Required. Section header
  fields: Field[]                 // Required. Fields inside
  admin?: {
    initCollapsed?: boolean       // Start collapsed (default: false)
    condition?: Function
  }
}
// No name required - purely layout
```

**Payload config example:**
```typescript
{
  type: 'collapsible',
  label: 'Advanced Settings',
  admin: { initCollapsed: true },
  fields: [
    { name: 'customCSS', type: 'textarea' },
    { name: 'customJS', type: 'textarea' },
  ],
}
```

---

### tabs (Layout)

Tabbed interface for organizing fields.

**Full schema:**
```typescript
type TabsField = {
  type: 'tabs'
  tabs: Tab[]                     // Required. Array of tabs
  admin?: {
    condition?: Function
  }
}

type Tab = {
  label: string                   // Required. Tab label
  name?: string                   // If set, fields are nested under this key
  fields: Field[]                 // Required. Fields in this tab
  description?: string            // Help text for tab
}
// No name on parent - tabs are layout only (unless tab has name)
```

**Payload config example:**
```typescript
{
  type: 'tabs',
  tabs: [
    {
      label: 'Content',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'body', type: 'richText' },
      ],
    },
    {
      label: 'SEO',
      name: 'seo',  // Fields nested under 'seo' key
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}
```

---

### ui (Custom Component)

Render custom React component without storing data.

**Full schema:**
```typescript
type UIField = {
  type: 'ui'
  name: string                    // Required (for key, not storage)
  admin: {
    components: {
      Field: Component            // Required. React component to render
      Cell?: Component            // List view component
    }
    condition?: Function
  }
}
// Does NOT store data - purely visual
```

---

## Collection-Level Configuration

### Basic Collection

```typescript
const posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Post',
    plural: 'Posts',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'content', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { name: 'publishedAt', type: 'date' },
  ],
}
```

### Upload Collection

```typescript
const media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  upload: {
    staticDir: 'media',           // Directory for files (relative to project)
    staticURL: '/media',          // URL path prefix
    mimeTypes: ['image/*', 'application/pdf'],  // Allowed types
    filesRequiredOnCreate: true,  // Require file on create (default: true)

    // Image-specific options:
    imageSizes: [                 // Auto-generate resized versions
      { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 1024, position: 'centre' },
      { name: 'tablet', width: 1024 },  // Height auto
    ],
    adminThumbnail: 'thumbnail',  // Size to show in admin
    focalPoint: true,             // Enable focal point selection
    crop: true,                   // Enable cropping

    // Storage adapter (optional - defaults to local):
    // adapter: s3Adapter({ ... })
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'textarea' },
  ],
}
```

**Upload document auto-fields:**
When you create an upload collection, Payload automatically adds these fields:
- `filename` - Original filename
- `mimeType` - File MIME type
- `filesize` - Size in bytes
- `width` - Image width (images only)
- `height` - Image height (images only)
- `url` - Public URL to file
- `thumbnailURL` - URL to thumbnail (if imageSizes configured)
- `sizes` - Object with all generated size URLs

### Auth Collection

```typescript
const users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    { name: 'name', type: 'text' },
    { name: 'role', type: 'select', options: ['admin', 'editor', 'user'] },
  ],
}
```

---

## Common Migration Patterns

### WordPress to Payload

| WordPress | Payload |
|-----------|---------|
| `post_title` | `text` (title) |
| `post_content` | `richText` (HTML) |
| `post_excerpt` | `textarea` |
| `post_status` | `select` (draft/published) |
| `post_author` | `relationship` to users |
| `featured_media` | `upload` to media |
| `post_date` | `date` |
| ACF Repeater | `array` |
| ACF Group | `group` |
| ACF Flexible Content | `blocks` |

### Contentful to Payload

| Contentful | Payload |
|------------|---------|
| Short Text | `text` |
| Long Text | `textarea` |
| Rich Text | `richText` (needs conversion) |
| Number | `number` |
| Date | `date` |
| Boolean | `checkbox` |
| Media | `upload` |
| Reference | `relationship` |
| Array of References | `relationship` (hasMany) |

### Strapi to Payload

| Strapi | Payload |
|--------|---------|
| string | `text` |
| text | `textarea` |
| richtext/blocks | `richText` |
| integer/float/decimal | `number` |
| boolean | `checkbox` |
| date/datetime | `date` |
| enumeration | `select` |
| media | `upload` |
| relation | `relationship` |
| component | `group` or `array` |
| dynamiczone | `blocks` |

---

## AI Instructions

When analyzing source data to generate Payload config:

1. **Identify collections** - Each distinct content type becomes a collection
2. **Detect relationships** - ID references between types become `relationship` fields
3. **Infer field types** - Use the patterns above to match data to Payload types
4. **Preserve structure** - Nested objects become `group`, arrays of objects become `array`
5. **Flag unknowns** - If data doesn't match patterns, suggest `json` as fallback and add a warning
6. **Generate valid TypeScript** - Output should be copy-paste ready

**Output format:**
```typescript
import type { CollectionConfig } from 'payload'

export const collectionName: CollectionConfig = {
  slug: 'collection-name',
  fields: [
    // fields here
  ],
}
```
