# ESLint and Prettier Configuration

This project is configured with ESLint for code linting and Prettier for code formatting.

## ESLint Configuration

The project uses ESLint v9 with the new flat configuration format in `eslint.config.js`.

### Rules Configured:

- **TypeScript ESLint**: Basic recommended rules for TypeScript
- **No unused variables**: Error (with exception for variables starting with `_`)
- **No explicit any**: Warning (allows `any` in test files)
- **Console logs**: Warning (allowed in test files)
- **Prettier integration**: Formats code automatically

### Ignored Files:

- `node_modules/`
- `dist/`
- `coverage/`
- Log files
- Lock files

## Prettier Configuration

Prettier is configured in `.prettierrc` with the following settings:

- **Semi-colons**: Required
- **Quotes**: Single quotes
- **Print width**: 80 characters
- **Tab width**: 2 spaces
- **Trailing commas**: ES5 style
- **Arrow function parentheses**: Always

## Available Scripts

- `pnpm lint` - Run ESLint on TypeScript files
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Format files with Prettier
- `pnpm format:check` - Check if files are formatted
- `pnpm type-check` - Run TypeScript type checking

## VS Code Integration

For the best development experience, install these VS Code extensions:

- ESLint
- Prettier - Code formatter

These will provide real-time linting and formatting in your editor.

## Pre-commit Hooks (Optional)

You can add Husky and lint-staged to run linting and formatting before commits:

```bash
pnpm add -D husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "src/**/*.ts": ["eslint --fix", "prettier --write"]
  }
}
```
