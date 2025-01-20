import { Plugin, WorkspaceLeaf, MarkdownView, TFile } from 'obsidian';

export default class ReaderModePlugin extends Plugin {
    private openFiles: Set<string> = new Set();

    async onload() {
        // Track initially open files
        this.app.workspace.iterateAllLeaves(leaf => {
            if (leaf.view instanceof MarkdownView && leaf.view.file) {
                this.openFiles.add(leaf.view.file.path);
            }
        });

        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                this.openFiles.clear();
                this.app.workspace.iterateAllLeaves(leaf => {
                    if (leaf.view instanceof MarkdownView && leaf.view.file) {
                        this.openFiles.add(leaf.view.file.path);
                    }
                });
            })
        );

        this.registerEvent(
            this.app.workspace.on('file-open', async (file: TFile | null) => {
                if (!file || !(file instanceof TFile)) return;

                const leaf = this.app.workspace.getActiveViewOfType(MarkdownView)?.leaf;
                if (!leaf || !(leaf.view instanceof MarkdownView)) return;

                // Only proceed if this is the first time we're opening this file
                if (this.openFiles.has(file.path)) return;
                this.openFiles.add(file.path);

                try {
                    const content = await this.app.vault.cachedRead(file);
                    if (!content.trim()) return;

                    const state = leaf.getViewState();
                    if (!state.state) return;

                    state.state.mode = 'preview';
                    state.state.source = false;

                    await leaf.setViewState(state);
                } catch (error) {
                    console.error('Error forcing preview mode:', error);
                }
            })
        );
    }
}