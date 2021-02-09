Google Apps Script: Markdown Converter
==========================================









# Development

Some patches are made to ensure that the code can run both on GAS and jest.

- `src/vendor/marked.js`: the module export handling at the beginning was removed and replaced with a simple `var marked = (functino() { ...` and the end of the file is replaced with `})();`
- `src/renderer.ts`, etc: no export is used
- `tests/*`: use `require('../src/renderer')` instead of `import { renderer } from '../src/renderer'`
