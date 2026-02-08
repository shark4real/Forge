# Forge Architecture — Responsibility Split

## 🎯 Core Principle: NEVER Trust AI Output

**AI output must NEVER be passed directly to JSX.**

A mandatory normalization layer must exist between the AI and Tambo's renderer.

---

## 📐 Architectural Boundary

### The Correct Pipeline:

```
User Prompt
    ↓
AI (Tambo / Groq LLM)
    ↓
Raw UI Blueprint (UNSAFE JSON)
    ↓
💎 Blueprint Normalizer (OUR RESPONSIBILITY)
    ↓
Safe UI Blueprint (validated, sanitized)
    ↓
Tambo Renderer (dynamic component mapping)
    ↓
React Components (preview)
```

---

## 🔀 Responsibility Split

### Tambo's Role (Dynamic UI Rendering)

**Tambo IS responsible for:**
✅ Dynamically rendering React components chosen by the AI  
✅ Mapping AI-selected component names to real React components via registry  
✅ Re-rendering the UI when the AI blueprint changes  
✅ Preserving UI continuity across updates  
✅ Reporting component render failures (error boundaries)  

**Tambo is NOT responsible for:**
❌ Validating or sanitizing AI output  
❌ Fixing malformed props  
❌ Preventing invalid React children  
❌ Normalizing AI JSON  
❌ Handling business logic or data correctness  

---

### Our Role (Normalization & Validation)

**We ARE responsible for:**
✅ Validating all AI output before it reaches React  
✅ Sanitizing props (converting objects to strings)  
✅ Preventing "Objects are not valid as a React child" crashes  
✅ Ensuring all props are React-safe (strings, numbers, booleans, arrays)  
✅ Dropping unknown components gracefully (with warnings)  
✅ Providing fallback values for missing/malformed props  
✅ Deep sanitization of nested data structures  
✅ NEVER throwing — always returning a valid blueprint  

---

## 🛡️ Safety Layers

### Layer 1: Tambo Entry Point (`ForgeBlueprint` component)

**File:** [`src/lib/tambo.tsx`](./src/lib/tambo.tsx)

```tsx
export function ForgeBlueprint(props: UIBlueprint) {
  // DEFENSIVE: Treat props as completely untrusted raw input from AI.
  const rawInput = typeof props === "object" && props !== null ? props : {};
  
  const { blueprint, warnings } = normalizeBlueprint(rawInput);
  
  // DEFENSIVE: Always render normalized blueprint, never raw AI props
  return <BlueprintRenderer blueprint={blueprint} />;
}
```

**Guarantees:**
- AI props are NEVER passed directly to React
- All blueprints go through `normalizeBlueprint()` first
- Malformed input → fallback blueprint with safe defaults

---

### Layer 2: Blueprint Normalizer (`normalizeBlueprint()`)

**File:** [`src/lib/normalizeBlueprint.ts`](./src/lib/normalizeBlueprint.ts)

**Critical helpers:**

#### `toSafeString(val: unknown): string`
Prevents "Objects are not valid as a React child" crashes.

```typescript
// AI may output {label: "Buy Now", href: "/pricing"}
// We extract "Buy Now" (the displayable part)
toSafeString({label: "Get Started", href: "/signup"})
// → "Get Started" ✅
```

#### `sanitizeValue(val: unknown): unknown`
Recursively sanitizes nested objects so no value can crash React.

```typescript
sanitizeValue({
  stats: [{label: "Users", value: 1200}],
  meta: {created: new Date()}  // ← Date object would crash
})
// → {stats: [{label: "Users", value: 1200}], meta: {created: "Sat, 08 Feb 2026..."}}
```

#### Per-Component Normalizers
Each registry component has a dedicated normalizer:
- `NavigationBar()` → converts `{label,href}[]` to `string[]`
- `DataTable()` → ensures rows are `Record<string, string|number>[]`
- `ChartView()` → validates `{label, value}[]` with numeric values
- `FeatureGrid()` → normalizes `{icon?, title, description}[]`
- ...and 10+ more

**Guarantees:**
- Unknown components → dropped (with warning)
- Malformed props → replaced with safe defaults
- Object props → flattened to strings
- NEVER throws → always returns valid blueprint

---

### Layer 3: Blueprint Renderer (Component Mapping)

**File:** [`src/components/BlueprintRenderer.tsx`](./src/components/BlueprintRenderer.tsx)

**Defense-in-depth:**
1. **Registry lookup:** Unknown component → `FallbackComponent`
2. **Error boundary per component:** One crash ≠ entire app crash
3. **Zod safeParse:** Re-validate props (double-check)
4. **Graceful degradation:** Preview ALWAYS renders something

```tsx
<ComponentErrorBoundary name={componentName}>
  {createElement(registryComponent, validatedProps)}
</ComponentErrorBoundary>
```

---

### Layer 4: Registry Components (Render-Safe Helpers)

**Files:** [`src/registry/components/*.tsx`](./src/registry/components/)

Every registry component includes a `safe()` helper:

```tsx
function safe(val: unknown): string {
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return (val as any).label ?? (val as any).title ?? String(val);
  }
  return String(val);
}

// Used in JSX:
<div>{safe(props.title)}</div>  // ✅ Never crashes
```

---

## 🚨 What We Prevent

### ❌ CRASH: Objects as JSX Children
```tsx
// AI outputs:
{ title: {label: "Welcome", icon: "👋"} }

// Without normalization:
<h1>{props.title}</h1>  // 💥 ERROR: Objects are not valid as a React child

// With normalization:
<h1>{safe(props.title)}</h1>  // ✅ "Welcome"
```

### ❌ CRASH: Unknown Components
```tsx
// AI outputs:
{ componentName: "SuperWidget" }  // Not in registry!

// Without normalization:
createElement(undefined, props)  // 💥 ERROR

// With normalization:
<FallbackComponent name="SuperWidget" />  // ✅ Skipped with warning
```

### ❌ CRASH: Malformed Arrays
```tsx
// AI outputs:
{ links: "Home, About, Contact" }  // String instead of array!

// Without normalization:
links.map(...)  // 💥 ERROR: links.map is not a function

// With normalization:
toStringArray(links)  // ✅ ["Home, About, Contact"] or []
```

---

## ✅ Code Locations

| Layer | File | Responsibility |
|-------|------|----------------|
| **Entry** | `src/lib/tambo.tsx` (`ForgeBlueprint`) | Tambo boundary — calls normalizer |
| **Normalization** | `src/lib/normalizeBlueprint.ts` | Validates & sanitizes all AI output |
| **Rendering** | `src/components/BlueprintRenderer.tsx` | Maps components + error boundaries |
| **Components** | `src/registry/components/*.tsx` | Individual registry components with `safe()` helpers |
| **Fallback (Groq)** | `src/components/GroqChatInterface.tsx` | Groq fallback — also calls normalizer |
| **Fallback (Tambo)** | `src/components/TamboChatInterface.tsx` | Tambo errors → fallback normalizer |

---

## 🧪 Testing the Pipeline

To verify the normalization layer is working:

1. **Malformed input:**
   ```json
   {
     "appType": "test",
     "sections": [{
       "id": "test",
       "components": [{
         "componentName": "NavigationBar",
         "props": {
           "brand": {"label": "My App", "icon": "🚀"},
           "links": "Home|About|Contact",
           "ctaLabel": {"label": "Sign Up", "href": "/signup"}
         }
       }]
     }]
   }
   ```

2. **Expected normalization:**
   - `brand`: `"My App"` (object → string)
   - `links`: `["Home|About|Contact"]` (string → array)
   - `ctaLabel`: `"Sign Up"` (object → string)

3. **Result:** Preview renders without crashing ✅

---

## 📊 Normalization Warnings

All normalization issues are logged and returned:

```typescript
{
  blueprint: { /* normalized */ },
  warnings: [
    {
      type: "dropped-component",
      sectionId: "hero",
      componentName: "SuperWidget",
      detail: "Unknown component — not in registry"
    },
    {
      type: "fixed-prop",
      sectionId: "nav",
      componentName: "NavigationBar",
      detail: "Converted object prop 'brand' to string"
    }
  ]
}
```

These are displayed in the **Explainability Panel** so users understand what was corrected.

---

## 🎓 Key Takeaways

1. **AI is NOT trustworthy** → Always normalize before rendering
2. **Tambo is a renderer, NOT a validator** → We validate
3. **One broken prop ≠ broken app** → Error boundaries isolate failures
4. **Objects never render directly** → `toSafeString()` everywhere
5. **Never throw** → Always return something valid

---

## 🔗 Related Files

- [`src/types/blueprint.ts`](./src/types/blueprint.ts) — Blueprint TypeScript types
- [`src/registry/index.ts`](./src/registry/index.ts) — Component registry
- [`src/lib/forgeState.tsx`](./src/lib/forgeState.tsx) — State management (dispatches normalized blueprints)

---

**Last Updated:** Architectural refactor to enforce normalization boundary (Feb 2026)
