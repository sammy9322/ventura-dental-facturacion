const puppeteer = require('puppeteer');
const minimist = require('minimist');
const path = require('path');

const args = minimist(process.argv.slice(2));

if (args._.length < 2) {
    console.error('Usage: node snap.js <url_or_file> <output_image>');
    process.exit(1);
}

const input = args._[0];
const output = args._[1];

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        let url = input;
        // If input is a file path, convert to file:// URL
        if (!input.startsWith('http') && !input.startsWith('file://')) {
            url = `file://${path.resolve(input)}`;
        }

        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Set viewport size (full HD default)
        await page.setViewport({ width: 1920, height: 1080 });

        console.log(`Taking screenshot to ${output}...`);
        await page.screenshot({ path: output, fullPage: true });

    } catch (err) {
        console.error('Error taking screenshot:', err);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
