const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const targetDir = args[0] || 'docs';

console.log(`Scaffolding documentation structure in: ${targetDir}`);

const structure = [
    '',
    'assets',
    'assets/images',
    'assets/images/screenshots',
    'assets/images/diagrams',
    'guides',
    'reference',
    'adr' // Architecture Decision Records
];

try {
    // Create folders
    structure.forEach(folder => {
        const fullPath = path.join(targetDir, folder);
        if (!fs.existsSync(fullPath)) {
            console.log(`Creating ${fullPath}...`);
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });

    // Create index.md if not exists
    const indexFile = path.join(targetDir, 'index.md');
    if (!fs.existsSync(indexFile)) {
        console.log(`Creating ${indexFile}...`);
        const template = `# Documentation Root

Welcome to the documentation vault.

## Structure
- [[guides/getting-started]] - How to start.
- [[reference/api-specification]] - API Details.
- [[adr/001-architecture]] - Decisions.

## Assets
![Example](assets/images/example.png)

This file is the entry point for \`docs-renderer\`.
`;
        fs.writeFileSync(indexFile, template);
    }

    console.log('Scaffolding complete.');

} catch (err) {
    console.error('Error scaffolding:', err);
    process.exit(1);
}
