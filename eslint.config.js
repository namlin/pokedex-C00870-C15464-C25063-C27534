// =============================================================
//  Configuración de ESLint (formato "flat config", el moderno).
//  Acotada al juego de memoria para no tocar el resto del proyecto.
//  Correr con:  npx eslint public/js/memoria
// =============================================================
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    files: ['public/js/memoria/**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser, // document, fetch, setTimeout, etc.
    },
    rules: {
      ...js.configs.recommended.rules,
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: 'error',
    },
  },
];
