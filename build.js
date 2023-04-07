const fs = require('fs'),
      path = require('path'),
      glob = require('glob'),
      archiver = require('archiver');

// Exit handler since some function calls are async
process.on('exit', function(options, exitCode) {
	if (exitCode === 0) {
		// \x1b[32m = set terminal color to green
		// %s       = format specifier for the string to be printed
		// \x1b[0m  = reset terminal color
		// See https://stackoverflow.com/a/41407246
		console.log('\x1b[32m%s\x1b[0m', 'Successfully built.');
	}
}.bind(null, { cleanup: true }));

const srcDir   = path.join(__dirname, 'src'),
      buildDir = path.join(__dirname, 'build');

// These names must be exact like the filename suffixes
// Eg: popup_chrome.js, popup_firefox.js,
const browsers = [
	{
		name: 'chromium',
		archiveExt: 'zip'
	},
	{
		name: 'firefox',
		archiveExt: 'xpi'
	}
];

try {
	fs.rmSync(buildDir, { recursive: true }); // Remove old build dir
	browsers.forEach(browser => {
		const unpackedDir = path.join(buildDir, browser.name, 'unpacked');
		buildUnpacked(unpackedDir, browser);
		addLicense(unpackedDir);
		buildPacked(unpackedDir, browser);
	});
} catch (err) {
	console.error('\x1b[31m%s\x1b[0m', 'Failed to build: ' + err);
	process.exit(1);
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
				filepathObj.name.lastIndexOf("_")
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
}

// Add license as .txt to unpacked directory
function addLicense(unpackedDir) {
	const srcPath  = path.join(__dirname, 'LICENSE');
	const destPath = path.join(unpackedDir, 'LICENSE.txt');
	fs.cpSync(srcPath, destPath); // Created unpacked dir
}

// Build the packed files for each distribution (zip, xpi)
function buildPacked(unpackedDir, browser) {
	let manifest = JSON.parse(
		fs.readFileSync(
			path.join(unpackedDir, 'manifest.json')
		)
	);

	const zipName = `old-genius_${manifest.version}_${browser.name}.mv${manifest.manifest_version}.${browser.archiveExt}`;
	const outputPath = path.join(unpackedDir, '..', zipName);
	const output = fs.createWriteStream(outputPath);

	const archive = archiver('zip');

	output.on('close', () => {
		console.log(`${zipName} built (${archive.pointer()} bytes)`);
	});

	archive.on('error', (err) => {
		console.error('\x1b[31m%s\x1b[0m', 'Failed to pack: ' + err);
		process.exit(1);
	});

	// pipe archive data to the file
	archive.pipe(output);

	// append files from a sub-directory and naming it `new-subdir` within the archive
	archive.directory(unpackedDir, false);

	// finalize the archive (ie we are done appending files but streams have to finish yet)
	archive.finalize();
}

