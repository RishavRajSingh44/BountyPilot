import js from '@eslint/js';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
export default ts.config(
  { ignores: ['.next/**', '.cache/**', '.runtime/**', 'data/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  { files: ['**/*.tsx'], plugins: { 'react-hooks': hooks }, rules: hooks.configs.recommended.rules },
  { languageOptions: { globals: { process: 'readonly', console: 'readonly', fetch: 'readonly', Request: 'readonly', Response: 'readonly', Headers: 'readonly', AbortSignal: 'readonly', AbortController: 'readonly', crypto: 'readonly', btoa: 'readonly', performance: 'readonly', setTimeout: 'readonly', URL: 'readonly' } } },
);
