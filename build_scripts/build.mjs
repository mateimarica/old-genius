'use strict';

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import archiver from 'archiver';
import { rootDir, buildDir, srcDir } from './dirs.mjs';

// Exit handler since some function calls are async
let exitMsg; // This string will be printed upon exit
process.on('exit', function(options, exitCode) {
	// Example:
	// \x1b[32m = set terminal color to green
	// %s       = format specifier for the string to be printed
	// \x1b[0m  = reset terminal color
	// See https://stackoverflow.com/a/41407246
	const printColor = exitCode === 0 ? '\x1b[32m%s\x1b[0m' : '\x1b[31m%s\x1b[0m';
	console.log(printColor, exitMsg);
}.bind(null, { cleanup: true }));

// These names must be exact like the filename suffixes
// Eg: popup_chrome.js, popup_firefox.js,
const browsers = [
	{
		name: 'chromium',
		archiveExt: 'zip'
	},
	{
		name: 'firefox',
		archiveExt: 'zip'
	}
];

validateVersions();

try {
	fs.rmSync(buildDir, { recursive: true }); // Remove old build dir
	browsers.forEach(browser => {
		const unpackedDir = path.join(buildDir, browser.name, 'unpacked');
		buildUnpacked(unpackedDir, browser);
		addLicense(unpackedDir);
		buildPacked(unpackedDir, browser);
	});
} catch (err) {
	exitMsg = 'Failed to build: ' + err;
	process.exit(1);
}

// Ensure that all version variables are the same
function validateVersions() {
	const versions = [];

	// Load the package.json
	const packageFilename = 'package.json';
	const packageJSON = JSON.parse(
		fs.readFileSync(
			path.join(rootDir, packageFilename)
		)
	);
	versions.push({ name: packageFilename, version: packageJSON.version });

	// Load every manifest_<browser>.json
	browsers.forEach(browser => {
		const manifestFilename = `manifest_${browser.name}.json`;
		const manifestJSON = JSON.parse(
			fs.readFileSync(
				path.join(srcDir, manifestFilename)
			)
		);
		versions.push({ name: manifestFilename, version: manifestJSON.version });
	});

	// If not all the versions are the same,
	if (!versions.every((val, i, arr) => val.version === versions[0].version)) {
		exitMsg = 'Inconsistent versioning:\n' + JSON.stringify(versions, null, 2);
		process.exit(1);
	}
}

// Build the unpacked extension
function buildUnpacked(unpackedDir, browser) {
	fs.cpSync(srcDir, unpackedDir, { recursive: true }); // Created unpacked dir

	// Build the glob pattern stirng. Example output:
	// C:/Users/Matei/old-genius/build/firefox/**/*_{chrome,firefox}.*
	const globPattern = path.join(
		unpackedDir,
		`**/*_{${browsers.map(b => b.name).join(',')}}.*`
	).replace(/\\/g, '/'); // Glob won't work with backslashes if on Windows, replace with forward slashes

	// Go through each browser-suffixed file and either rename it or delete it
	glob.sync(globPattern).forEach(filepathStr => {
		const filepathObj = path.parse(filepathStr);
		if (filepathObj.name.endsWith(`_${browser.name}`)) { // If the browser suffix matches, we keep it
			filepathObj.name = filepathObj.name.substring( // Remove the browser suffix
				0,
				filepathObj.name.lastIndexOf('_')
			);

			// Remove the base key (eg: "popup_chrome.js")
			// so that path.format will build the name using name and ext keys instead
			delete filepathObj.base;

			const newFilepath = path.format(filepathObj); // Put the path obj back together

			fs.renameSync(filepathStr, newFilepath); // Rename to get rid of _<browser> suffix
		} else {
			fs.rmSync(filepathStr); // If not for this browser, delete
		}
	});

	// Print browser name with first letter capitalized
	console.log(browser.name[0].toUpperCase() + browser.name.slice(1) + ' unpacked directory built.');
}

// Add license as .txt to unpacked directory
function addLicense(unpackedDir) {
	const srcPath  = path.join(rootDir, 'LICENSE');
	const destPath = path.join(unpackedDir, 'LICENSE.txt');
	fs.cpSync(srcPath, destPath); // Created unpacked dir
}

// Build the packed files for each distribution (zip, xpi)
function buildPacked(unpackedDir, browser) {
	if (browser.archiveExt === null) return;

	const manifestJSON = JSON.parse(
		fs.readFileSync(
			path.join(unpackedDir, 'manifest.json')
		)
	);

	const zipName = `old-genius_${manifestJSON.version}_${browser.name}.mv${manifestJSON.manifest_version}.${browser.archiveExt}`;
	const outputPath = path.join(unpackedDir, '..', zipName);
	const output = fs.createWriteStream(outputPath);

	const archive = archiver('zip');

	output.on('close', () => {
		console.log(`${zipName} built (${archive.pointer()} bytes)`);
	});

	archive.on('error', (err) => {
		exitMsg = 'Failed to pack: ' + err;
		process.exit(1);
	});

	// pipe archive data to the file
	archive.pipe(output);

	// append files from a sub-directory and naming it `new-subdir` within the archive
	archive.directory(unpackedDir, false);

	// finalize the archive (ie we are done appending files but streams have to finish yet)
	archive.finalize();
}

exitMsg = 'Build successful.';