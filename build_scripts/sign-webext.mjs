'use strict';

import path from 'path';
import webExt from 'web-ext';
import * as dotenv from 'dotenv';
dotenv.config();
import { buildDir } from './dirs.mjs';

const unpackedDir = path.join(buildDir, 'firefox', 'unpacked');

webExt.cmd.sign(
	{
		// Cmd options derived from their CLI counterpart. Eg: --source-dir is sourceDir
		sourceDir: unpackedDir,
		artifactsDir: path.join(unpackedDir, '..'), // destination directory
		apiKey: process.env.API_KEY_FIREFOX,
		apiSecret: process.env.API_SECRET_FIREFOX
	},
	{
		// Non-cmd related options for each function.
		shouldExitProgram: false // Need this so the this node script keeps running after
	}
);