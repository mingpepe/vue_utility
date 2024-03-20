const fs = require('fs').promises;
const path = require('path');

async function reorder(directoryPath) {
    try {
        const files = await fs.readdir(directoryPath);

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.stat(filePath);

            if (stats.isDirectory()) {
                await reorder(filePath);
            } else if (filePath.endsWith('.vue')) {
                await reorderVueFile(filePath);
            }
        }
    } catch (error) {
        console.error(`Error replacing template with script in ${directoryPath}: ${error}`);
    }
}

async function reorderVueFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');

        const idxTemplateStart = content.indexOf('<template>');
        const idxTemplateEnd = content.indexOf('</template>');

        const idxScriptStart = content.indexOf('<script');
        const idxScriptEnd = content.indexOf('</script>');

        const idxStyleStart = content.indexOf('<style');
        const idxStyleEnd = content.indexOf('</style>');

        let scriptContent = content.substring(idxScriptStart, idxScriptEnd + '</script>'.length);
        if (!scriptContent.endsWith('\n')) {
            scriptContent += '\n';
        }
        let templateContent = content.substring(idxTemplateStart, idxTemplateEnd + '</template>'.length);
        if (!templateContent.endsWith('\n')) {
            templateContent += '\n';
        }

        let styleContent = content.substring(idxStyleStart, idxStyleEnd + '</style>'.length);
        if (!templateContent.endsWith('\n')) {
            templateContent += '\n';
        }

        const newContent = `${scriptContent}\n${templateContent}\n${styleContent}\n`;
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`Replaced template tags in ${filePath}`);
    } catch (error) {
        console.error(`Error replacing template tags in ${filePath}: ${error}`);
    }
}

const directoryPath = process.argv[2];
if (!directoryPath) {
    console.error('Please provide the directory path as an argument.');
    process.exit(1);
}

reorder(directoryPath)
    .then(() => console.log('Replacement completed successfully.'))
    .catch(error => console.error('Error occurred:', error));
