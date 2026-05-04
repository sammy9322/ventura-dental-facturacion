const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');
const MarkdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItTexMath = require('markdown-it-texmath');
const markdownItWikiLinks = require('markdown-it-wikilinks');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

if (args._.length < 2) {
    console.error('Usage: node convert.js <input_file1> [input_file2 ...] <output_file> [--theme name] [--format html|pdf]');
    process.exit(1);
}

const outputFile = args._.pop();
const inputFiles = args._;
const theme = args.theme || 'modern';
const format = args.format || 'pdf';

// Theme Configuration
const themes = {
    modern: { css: 'modern.css', mermaid: 'neutral' },
    classic: { css: 'classic.css', mermaid: 'default' },
    dark: { css: 'dark.css', mermaid: 'dark' },
    technical: { css: 'modern.css', mermaid: 'neutral' } // Fallback/Variant
};

const currentTheme = themes[theme] || themes.modern;

// Initialize MarkdownIt
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
}).use(markdownItAnchor)
    .use(markdownItTexMath, {
        engine: require('katex'),
        delimiters: 'dollars',
        katexOptions: { macros: { "\\RR": "\\mathbb{R}" } }
    })
    .use(markdownItWikiLinks({
        baseURL: '',
        makeAllLinksAbsolute: false,
        uriSuffix: '.html', // For HTML export, links point to .html
        postProcessPageName: (pageName) => {
            return pageName.trim().toLowerCase().replace(/\s/g, '-');
        }
    }));

// Custom renderer for images (Base64 Embed)
const defaultImageRender = md.renderer.rules.image || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};

let currentInputFile = '';

md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const srcIndex = token.attrIndex('src');
    const src = token.attrs[srcIndex][1];

    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
        const imagePath = path.resolve(path.dirname(currentInputFile), src);
        try {
            if (fs.existsSync(imagePath)) {
                // console.log(`Embedding image: ${src}`);
                const fileContent = fs.readFileSync(imagePath);
                const extension = path.extname(imagePath).slice(1);
                const base64Image = Buffer.from(fileContent).toString('base64');
                token.attrs[srcIndex][1] = `data:image/${extension};base64,${base64Image}`;
            } else {
                console.warn(`Warning: Image not found at ${imagePath}`);
            }
        } catch (err) {
            console.warn(`Warning: Could not read image at ${imagePath}`, err);
        }
    }
    return defaultImageRender(tokens, idx, options, env, self);
};

// Custom renderer for Mermaid
const defaultFence = md.renderer.rules.fence || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';

    if (info === 'mermaid') {
        return `<div class="mermaid">${token.content}</div>`;
    }
    return defaultFence(tokens, idx, options, env, self);
};

// Process Content
let mergedHtmlContent = '';

try {
    for (const inputFile of inputFiles) {
        console.log(`Processing ${inputFile}...`);
        currentInputFile = inputFile;
        const mdContent = fs.readFileSync(inputFile, 'utf-8');
        let html = md.render(mdContent);
        mergedHtmlContent += `<div class="file-content" data-file="${path.basename(inputFile)}">${html}</div>`;
        mergedHtmlContent += '<div style="page-break-after: always;"></div>';
    }

    // Read Theme CSS
    const cssPath = path.join(__dirname, '..', 'assets', 'themes', currentTheme.css);
    let cssContent = '';
    if (fs.existsSync(cssPath)) {
        cssContent = fs.readFileSync(cssPath, 'utf-8');
    } else {
        console.warn(`Theme CSS not found: ${cssPath}`);
    }

    // Read Mermaid Config
    const mermaidConfigPath = path.join(__dirname, '..', 'assets', 'mermaid-themes', `${theme}.json`);
    let mermaidConfig = { startOnLoad: true, theme: currentTheme.mermaid, flowchart: { useMaxWidth: true, htmlLabels: true } };

    if (fs.existsSync(mermaidConfigPath)) {
        try {
            const customConfig = JSON.parse(fs.readFileSync(mermaidConfigPath, 'utf-8'));
            mermaidConfig = { ...mermaidConfig, ...customConfig };
        } catch (e) {
            console.warn(`Error parsing mermaid config: ${e.message}`);
        }
    }

    // KaTeX CSS
    const katexCss = fs.readFileSync(require.resolve('katex/dist/katex.min.css'), 'utf-8');

    // HTML Template
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Documentation</title>
    <style>${katexCss}</style>
    <style>${cssContent}</style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize(${JSON.stringify(mermaidConfig)});
    </script>
</head>
<body>
    ${mergedHtmlContent}
</body>
</html>`;

    // Output Handling
    if (format === 'html') {
        fs.writeFileSync(outputFile, fullHtml);
        console.log(`HTML created successfully at: ${outputFile}`);
    } else {
        // PDF Generation via Puppeteer
        (async () => {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            try {
                await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 60000 });

                // Wait for mermaid
                await page.evaluate(async () => {
                    if (document.querySelector('.mermaid')) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        // SVG scaling fix
                        const graphs = document.querySelectorAll('.mermaid svg');
                        graphs.forEach(svg => {
                            svg.style.maxWidth = '100%';
                            svg.style.height = 'auto';
                            svg.removeAttribute('height');
                        });
                    }
                });

                await page.pdf({
                    path: outputFile,
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
                });

                console.log(`PDF created successfully at: ${outputFile}`);
            } catch (err) {
                console.error('Error generating PDF:', err);
                process.exit(1);
            } finally {
                await browser.close();
            }
        })();
    }

} catch (err) {
    console.error('Error processing file:', err);
    process.exit(1);
}
