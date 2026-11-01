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

## Published project

- **Storybook demo:** [hamzehabbass.github.io/accessible-component-library](https://hamzehabbass.github.io/accessible-component-library/)
- **npm package:** [hamzehabbass-accessible-ui](https://www.npmjs.com/package/hamzehabbass-accessible-ui) (`0.1.0`)
- **GitHub repository:** [hamzehabbass/accessible-component-library](https://github.com/hamzehabbass/accessible-component-library)

GitHub Actions deploys Storybook to GitHub Pages on every push to `main`. The CI workflow runs lint, tests with axe checks and coverage, the package build, and the Storybook build on pushes and pull requests.

## Publishing a new npm version

The current package is already published. To publish a later version:

1. Configure an npm publishing credential as the GitHub Actions repository secret `NPM_TOKEN`.
2. Bump the package version with `npm version patch` (or `minor`/`major`), then push the commit and tag.
3. Publish a GitHub Release for that tag. The release workflow runs lint, tests, and the package build before publishing to npm.

Keep the npm credential private. Prefer npm trusted publishing with GitHub Actions where available; if using a token, grant only the package permissions required to publish.

## Accessibility notes

Prefer native HTML controls when they provide the expected interaction. Keep labels visible, use meaningful table captions, provide a unique `id` for each accordion item, and give every `Tabs` instance unique tab item IDs. The date picker delegates its calendar UI and keyboard behavior to the user's browser. Automated accessibility checks complement, rather than replace, keyboard and screen-reader testing.

## License

MIT
