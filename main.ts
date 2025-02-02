import { Plugin, WorkspaceLeaf, MarkdownView, TFile } from 'obsidian';

export default class ReaderModePlugin extends Plugin {

	private newFilePath: string | null = null;

	async onload() {
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', async (leaf: WorkspaceLeaf | null) => {

				if (!leaf) return;
				if (!(leaf.view instanceof MarkdownView)) return;

				const view = leaf.view;
				const file = view.file;
				if (!file || !(file instanceof TFile)) return;

				if (this.newFilePath !== file.path) {
					this.newFilePath = null;
					return;
				}
				this.newFilePath = null;

				try {
					const state = leaf.getViewState();
					if (!state.state) return;

                    const content = await this.app.vault.cachedRead(file);
                    const strippedContent = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n*/, '').trim();
                    if (strippedContent) {
                        state.state.mode = 'preview';
                    } else {
                        state.state.mode = 'source';
                    }

					await leaf.setViewState(state);
				} catch (error) {
					console.error('Error forcing preview mode:', error);
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on('file-open', async (file: TFile | null) => {
				this.newFilePath = file ? file.path : null;
			})
		);
	}
}