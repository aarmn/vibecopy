// src/web/extension.ts

import * as vscode from 'vscode';

// formatter, maybe, one day, not today tho, lol
// zwj notice and add, cause it seems like its not working lol

// --- Helper functions remain the same ---
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

// --- Central function to generate the markdown content remains the same ---
async function generateMarkdownForFiles(urisToProcess: ReadonlyArray<vscode.Uri>): Promise<string | null> {
    if (urisToProcess.length === 0) {
        vscode.window.showInformationMessage('VibeCopy: No files selected.'); // Added prefix for clarity
        return null;
    }

    const decoder = new TextDecoder('utf-8');
    let hasValidFiles = false;
    // Add console log for debugging which URIs are being processed
    console.log('[VibeCopy] Processing URIs:', urisToProcess.map(u => u.toString()));

    const fileContentsPromises = urisToProcess.map(async (fileUri: vscode.Uri): Promise<string | null> => {
        const filename = getFileNameFromUri(fileUri);
        try {
            const stat = await vscode.workspace.fs.stat(fileUri);
            if (stat.type !== vscode.FileType.File) {
                console.log(`[VibeCopy] Skipping non-file item: ${fileUri.toString()}`);
                return null;
            }

            const uint8Array = await vscode.workspace.fs.readFile(fileUri);
            const fileContent = decoder.decode(uint8Array);
            const fileContentEscaped = fileContent.replaceAll('```', '`‌`‌`');
            const extension = getExtensionFromFilename(filename);
            const language = extension || 'plaintext';
            hasValidFiles = true;
            // Simple format for easier parsing if needed later
            return `---\nfile: ${filename}\n\`\`\`${language}\n${fileContentEscaped}\n\`\`\`\n---`;

        } catch (error: unknown) {
            // Improved error logging
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[VibeCopy] Error processing URI ${fileUri.toString()}: ${errorMessage}`, error);
            // Provide feedback in the output itself about which file failed
            return `<!-- VibeCopy Error reading ${filename}: ${errorMessage} -->`;
        }
    });

    const allResults = await Promise.all(fileContentsPromises);
    const formattedBlocks = allResults.filter((block): block is string => block !== null);

    if (!hasValidFiles || formattedBlocks.length === 0) {
        vscode.window.showWarningMessage('VibeCopy: No valid files could be read or processed.');
        return null;
    }

    // Check for blocks that start with the specific error comment
    if (formattedBlocks.some(block => block.startsWith('<!-- VibeCopy Error'))) {
         vscode.window.showWarningMessage('VibeCopy: Some files could not be read. Check logs for details.');
    }

    // Join blocks without the extra '---' at start/end here, add later if needed by context
    return formattedBlocks.join('\n'); // Simpler join, add surrounding '---' in command if desired
}

// --- Activation Function ---
export function activate(context: vscode.ExtensionContext) {

    console.log('[VibeCopy] Extension active!');

    // --- Register COMMAND: Copy Selected as Markdown (Desktop Only Logic) ---
    const copyCommandDisposable = vscode.commands.registerCommand('vibecopy.copySelectedAsMarkdown', async (
        uri?: vscode.Uri,
        selectedUris?: vscode.Uri[]
    ) => {
        // This command is only *useful* on desktop, but registration happens regardless.
        // We rely on the `when` clause in package.json for UI visibility.
        // We could add an explicit check, but clipboard API itself fails gracefully on web.
        console.log('[VibeCopy] Copy command triggered.');

        const urisToProcess: ReadonlyArray<vscode.Uri> = selectedUris ?? (uri ? [uri] : []);
        const markdownContent = await generateMarkdownForFiles(urisToProcess);

        if (markdownContent === null) {
            return; // generateMarkdownForFiles already showed a message
        }

        // Prepend/append '---' if desired for the final copied output
        const finalOutput = `<codes>\n${markdownContent}\n</codes>`;

        try {
            await vscode.env.clipboard.writeText(finalOutput);
            // Use a more explicit success notification
            vscode.window.showInformationMessage('VibeCopy: Formatted Markdown copied to clipboard!');
        } catch (error) {
            console.error("[VibeCopy] Failed to copy to clipboard:", error);
            vscode.window.showErrorMessage('VibeCopy: Failed to copy content to clipboard.');
        }
    });

    // --- Register COMMAND: Open Selected as Markdown (Web & Desktop) ---
    const openCommandDisposable = vscode.commands.registerCommand('vibecopy.openSelectedAsMarkdown', async (
        uri?: vscode.Uri,
        selectedUris?: vscode.Uri[]
    ) => {
        console.log('[VibeCopy] Open command triggered.');

        const urisToProcess: ReadonlyArray<vscode.Uri> = selectedUris ?? (uri ? [uri] : []);
        const markdownContent = await generateMarkdownForFiles(urisToProcess);

        if (markdownContent === null) {
            return; // generateMarkdownForFiles already showed a message
        }

        // Prepend/append '---' if desired for the final editor content
        const finalOutput = `<codes>\n${markdownContent}\n</codes>`;

        // This action works on both Web and Desktop
        try {
            const doc = await vscode.workspace.openTextDocument({
                content: finalOutput,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc, { preview: false });
             console.log('[VibeCopy] Opened content in new editor.');
        } catch (error) {
            console.error('[VibeCopy] Error opening content in editor:', error);
            vscode.window.showErrorMessage('VibeCopy: Failed to open content in editor.');
        }
    });

    // Add BOTH command disposables to the context subscriptions
    context.subscriptions.push(copyCommandDisposable);
    context.subscriptions.push(openCommandDisposable);
}

// --- Deactivation Function ---
export function deactivate() {
    console.log('[VibeCopy] Extension deactivated.');
}