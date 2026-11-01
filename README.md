# Accessible Component Library

[![CI](https://github.com/hamzehabbass/accessible-component-library/actions/workflows/ci.yml/badge.svg)](https://github.com/hamzehabbass/accessible-component-library/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/hamzehabbass-accessible-ui)](https://www.npmjs.com/package/hamzehabbass-accessible-ui)

A reusable React and TypeScript component library with keyboard support, accessible semantics, light/dark themes, and Arabic/English layouts.

**Demo:** [Storybook](https://hamzehabbass.github.io/accessible-component-library/) · **Package:** [npm](https://www.npmjs.com/package/hamzehabbass-accessible-ui)

## Components

| Component | Accessibility and behavior |
| --- | --- |
| `Button` | Native button behavior, variants, sizes, and visible keyboard focus |
| `Input`, `Select` | Native controls with validation state and error descriptions |
| `Checkbox`, `Radio`, `Switch` | Native checkbox/radio semantics; switch exposes checked state |
| `Modal`, `Drawer` | Dialog roles, Escape/backdrop dismissal, focus trap, and focus restoration |
| `Tabs` | Tab/tabpanel relationships, roving focus, arrow keys, Home, and End |
| `Accordion` | Expanded state and labelled panel relationships |
| `DropdownMenu` | Menu roles, arrow/Home/End navigation, Escape, and trigger focus return |
| `Tooltip` | Descriptive relationship and hover/focus visibility |
| `Toast` | Status/alert announcements, optional timeout and dismiss action |
| `Pagination` | Named navigation, page labels, and current-page state |
| `DataTable` | Caption, column headers, responsive horizontal scrolling, sortable columns |
| `DatePicker` | Labelled native date input with browser keyboard/calendar support |
| `FormField` | Label, hint, required state, and announced validation errors |
| `ThemeProvider`, `VisuallyHidden` | Direction/theme context and screen-reader-only content |

Each component has a Storybook story. The toolbar can switch between English/LTR and Arabic/RTL and between light and dark themes. Styles use CSS logical properties so layout follows the selected direction.

## Install

```sh
npm install hamzehabbass-accessible-ui
```

Import the stylesheet once in your application:

```tsx
import "hamzehabbass-accessible-ui/style.css";
import { Button, FormField, Input, ThemeProvider } from "hamzehabbass-accessible-ui";

export function Example() {
  return (
    <ThemeProvider dir="rtl" theme="dark">
      <FormField label="البريد الإلكتروني" required>
        <Input type="email" autoComplete="email" />
      </FormField>
      <Button>حفظ</Button>
    </ThemeProvider>
  );
}
```

The `ThemeProvider` is optional: set `dir="rtl"` and `data-theme="dark"` on an existing ancestor if your app already manages its own layout and theme.

## Develop

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
npm run storybook
npm test
npm run lint
npm run build
```

The test suite uses Vitest, React Testing Library, and axe. CI runs linting, tests with coverage, the package build, and the Storybook build on pushes and pull requests to `main`.

## Publish and deploy

1. Create the public GitHub repository `hamzehabbass/accessible-component-library` and push this project to its `main` branch.
2. In GitHub repository settings, enable Pages with **GitHub Actions** as the source.
3. Add an npm automation token as the repository Actions secret `NPM_TOKEN`.
4. Create and publish a GitHub Release. The release workflow publishes the package to npm and deploys Storybook to GitHub Pages.

The npm package name is `hamzehabbass-accessible-ui`; confirm it is available and that your npm account may publish it before the first release. Update the package name and README links if you choose a different name.

## Accessibility notes

Prefer native HTML controls when they provide the expected interaction. Keep labels visible, use meaningful table captions, provide a unique `id` for each accordion item, and give every `Tabs` instance unique tab item IDs. The date picker delegates its calendar UI and keyboard behavior to the user's browser. Automated accessibility checks complement, rather than replace, keyboard and screen-reader testing.

## License

MIT
