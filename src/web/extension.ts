// src/web/extension.ts

import * as vscode from 'vscode';

// --- Helper functions (getFileNameFromUri, getExtensionFromFilename) remain the same ---
function getFileNameFromUri(uri: vscode.Uri): string {
    const pathSegments = uri.path.split('/');
    return pathSegments[pathSegments.length - 1] || '';
}

function getExtensionFromFilename(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
        return filename.substring(lastDotIndex + 1);
    }
    return '';
}

// --- Central function to generate the markdown content (remains the same) ---
async function generateMarkdownForFiles(urisToProcess: ReadonlyArray<vscode.Uri>): Promise<string | null> {
    if (urisToProcess.length === 0) {
        return null; // No files to process
    }

    const decoder = new TextDecoder('utf-8');
    let hasValidFiles = false;

    const fileContentsPromises = urisToProcess.map(async (fileUri: vscode.Uri): Promise<string | null> => {
        const filename = getFileNameFromUri(fileUri);
        try {
            const stat = await vscode.workspace.fs.stat(fileUri);
            if (stat.type !== vscode.FileType.File) {
                console.log(`Skipping non-file item: ${fileUri.toString()}`);
                return null;
            }

            const uint8Array = await vscode.workspace.fs.readFile(fileUri);
            const fileContent = decoder.decode(uint8Array);
            const extension = getExtensionFromFilename(filename);
            const language = extension || 'plaintext';
            hasValidFiles = true;
            return `${filename}\n\`\`\`${language}\n${fileContent}\n\`\`\``;

        } catch (error: unknown) {
            let errorMessage = `Failed to process file: ${filename}`;
            if (error instanceof Error) { errorMessage += `. Reason: ${error.message}`; }
            else { errorMessage += `. Reason: ${String(error)}`; }
            console.error(`Error processing URI ${fileUri.toString()}:`, error);
            return `<!-- Error reading ${filename}: ${error instanceof Error ? error.message : String(error)} -->`;
        }
    });

    const allResults = await Promise.all(fileContentsPromises);
    const formattedBlocks = allResults.filter((block): block is string => block !== null);

    if (!hasValidFiles || formattedBlocks.length === 0) {
        vscode.window.showWarningMessage('No valid files could be read or processed.');
        return null;
    }

    if (formattedBlocks.some(block => block.startsWith('<!-- Error'))) {
         vscode.window.showWarningMessage('Some files could not be read. Check logs or output for details.');
    }

    const finalContent = formattedBlocks.join('\n---\n');
    return `---\n${finalContent}\n---`;
}


// --- Activation Function ---
export function activate(context: vscode.ExtensionContext) {

    // Update activation message to use the new name
    console.log('Congratulations, your extension "VibeCopy" is now active!');

    const disposable = vscode.commands.registerCommand('extension.openSelectedAsMarkdown', async (
        uri?: vscode.Uri,
        selectedUris?: vscode.Uri[]
    ) => {
        const urisToProcess: ReadonlyArray<vscode.Uri> = selectedUris ?? (uri ? [uri] : []);

        if (urisToProcess.length === 0) {
            vscode.window.showInformationMessage('No files selected in the Explorer.');
            return;
        }

        const markdownContent = await generateMarkdownForFiles(urisToProcess);

        if (markdownContent === null) {
            return;
        }

        // Conditional Action based on Environment
        if (vscode.env.uiKind === vscode.UIKind.Desktop) {
            // DESKTOP: Copy to clipboard
            try {
                await vscode.env.clipboard.writeText(markdownContent);
                // Adjusted message slightly
                vscode.window.showInformationMessage('Formatted Markdown copied to clipboard!');
            } catch (error) {
                console.error("Failed to copy to clipboard:", error);
                vscode.window.showErrorMessage('Failed to copy content to clipboard.');
            }
        } else {
            // WEB / UNKNOWN: Open in a new untitled editor
            try {
                const doc = await vscode.workspace.openTextDocument({
                    content: markdownContent,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, { preview: false });
            } catch (error) {
                console.error('Error opening final Markdown document:', error);
                vscode.window.showErrorMessage('Failed to open the combined Markdown document.');
            }
        }
    });

    context.subscriptions.push(disposable);
}

// --- Deactivation Function ---
export function deactivate() {
    console.log('Extension "VibeCopy" deactivated.');
}