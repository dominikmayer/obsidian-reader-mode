import { Plugin, WorkspaceLeaf, MarkdownView } from 'obsidian';

export default class ReaderModePlugin extends Plugin {
	async onload() {
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', async (leaf: WorkspaceLeaf | null) => {
				if (!leaf) return;
				if (!(leaf.view instanceof MarkdownView)) return;

				try {
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