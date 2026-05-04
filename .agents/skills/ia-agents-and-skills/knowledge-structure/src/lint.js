const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const args = process.argv.slice(2);
const targetDir = args[0] || '.';

console.log(`Linting WikiLinks in: ${targetDir}`);

(async () => {
    try {
        const files = await glob(`${targetDir}/**/*.md`, { ignore: 'node_modules/**' });

        // Create a set of valid link targets
        const validTargets = new Set();

        files.forEach(f => {
            // f is like "tests/demo-docs/guides/getting-started.md"
            // targetDir is "tests/demo-docs"

            // Relative path inside the vault: "guides/getting-started.md"
            const relativePath = path.relative(targetDir, f);

            // specific file name: "getting-started"
            const baseName = path.basename(f, '.md').toLowerCase();

            // path without extension: "guides/getting-started"
            const pathNoExt = relativePath.replace(/\.md$/, '').toLowerCase();

            validTargets.add(baseName);
            validTargets.add(pathNoExt);
        });

        let hasError = false;

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

            let match;
            while ((match = wikiLinkRegex.exec(content)) !== null) {
                const rawLink = match[1].trim();
                const linkSlug = rawLink.split('|')[0].trim().toLowerCase(); // Handle aliases in validation

                if (!validTargets.has(linkSlug)) {
                    console.error(`[ERROR] ${file}: Broken WikiLink [[${rawLink}]] (Target '${linkSlug}' not found)`);
                    hasError = true;
                }
            }
        }

        if (hasError) {
            console.error('Linting failed.');
            process.exit(1);
        } else {
            console.log('Linting passed.');
        }

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
