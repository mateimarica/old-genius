'use strict';

import path from 'path';

// Lil hack because __filename  & __dirname aren't defined in ES modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir  = path.join(__dirname, '..');
const srcDir   = path.join(rootDir, 'src'),
      buildDir = path.join(rootDir, 'build');

export { __dirname, rootDir, srcDir, buildDir };