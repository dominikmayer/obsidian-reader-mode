import { Plugin, WorkspaceLeaf, MarkdownView, TFile } from 'obsidian';

export default class ReaderModePlugin extends Plugin {
	async onload() {
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', async (leaf: WorkspaceLeaf | null) => {
				if (!leaf) return;
				if (!(leaf.view instanceof MarkdownView)) return;

				const view = leaf.view;
				const file = view.file;

				if (!file || !(file instanceof TFile)) return;

				try {
					// Read file content to check if the note is empty
					const content = await this.app.vault.cachedRead(file);
					if (!content.trim()) {
						// If the note is empty, do not force reader mode
						return;
					}

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