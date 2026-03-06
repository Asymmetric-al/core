# Unlayer Design JSON Reference

## Top-Level Structure

```typescript
interface JSONTemplate {
  counters: Record<string, number>;
  schemaVersion: number;
  body: {
    id: string;
    rows: Row[];
    headers: Row[];
    footers: Row[];
    values: BodyValues;
  };
}
```

## Body Values

```typescript
interface BodyValues {
  backgroundColor: string;
  contentWidth: string;
  fontFamily: { label: string; value: string };
  textColor: string;
  linkStyle: {
    inherit: boolean;
    linkColor: string;
    linkHoverColor: string;
    linkUnderline: boolean;
    linkHoverUnderline: boolean;
  };
  popupPosition?: string;
  popupWidth?: string;
  popupHeight?: string;
  borderRadius?: string;
  contentAlign?: string;
  contentVerticalAlign?: string;
}
```

## Row and Column Shape

```typescript
interface Row {
  id: string;
  cells: number[];
  columns: Column[];
  values: {
    displayCondition: object | null;
    columns: boolean;
    backgroundColor: string;
    columnsBackgroundColor: string;
    backgroundImage: {
      url: string;
      fullWidth: boolean;
      repeat: boolean;
      center: boolean;
      cover: boolean;
    };
    padding: string;
    _meta: { htmlID: string; htmlClassNames: string };
  };
}

interface Column {
  id: string;
  contents: ContentItem[];
  values: {
    _meta: { htmlID: string; htmlClassNames: string };
    border: object;
    padding: string;
    backgroundColor: string;
  };
}
```

## Content Items

```typescript
interface ContentItem {
  id: string;
  type: string;
  values: {
    containerPadding: string;
    anchor: string;
    textAlign: string;
    lineHeight: string;
    linkStyle: {
      inherit: boolean;
      linkColor: string;
      linkHoverColor: string;
      linkUnderline: boolean;
      linkHoverUnderline: boolean;
    };
    hideDesktop: boolean;
    displayCondition: object | null;
    _meta: { htmlID: string; htmlClassNames: string };
    selectable: boolean;
    draggable: boolean;
    duplicatable: boolean;
    deletable: boolean;
    hideable: boolean;
  };
}
```

Common content types:

- `text`
- `heading`
- `button`
- `image`
- `divider`
- `social`
- `html`
- `video`
- `menu`
- `timer`
- `table`
- `carousel`
- `paragraph`

Repo reminder:

- Save the design JSON alongside exported HTML/PDF flows so templates remain editable.
- Treat `schemaVersion` and shape compatibility carefully when restoring stored designs.
