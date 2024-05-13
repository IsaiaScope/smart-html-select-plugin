import { Plugin, WorkspaceWindow } from "obsidian";

export default class SelectOnFirePlugin extends Plugin {
	async onload() {
		this.app.workspace.on("window-open", this.setupWindowHandlers);
		this.setupWindowHandlers(undefined as never, activeWindow);

		this.addRibbonIcon("flame", "Insert a HTML select", () => {
			const view = this.app.workspace.activeEditor;
			if (!view?.editor) {
				return;
			}
			const randomId = this.generateUniqueId(
				view.editor.getDoc().getValue()
			);
			const select = createEl("select", { attr: { id: randomId } });
			for (let i = 1; i <= 5; i++) {
				const option = createEl("option", {
					text: `option ${i}`,
					attr: { value: `${i}` },
				});
				select.appendChild(option);
			}
			view.editor.replaceSelection(select.outerHTML);
		});
	}
	async onunload() {
		this.app.workspace.off("window-open", this.setupWindowHandlers);
	}

	private generateUniqueId(page: string): string {
		let id = crypto.randomUUID().slice(-6);
		while (this.idExistsInFile(id, page)) {
			id = crypto.randomUUID();
		}
		return id;
	}

	private idExistsInFile(id: string, page: string): boolean {
		const idIndex = page.search(id);
		return idIndex !== -1;
	}

	private setupWindowHandlers = (
		_workspaceWindow: WorkspaceWindow,
		win: Window
	) => {
		this.registerDomEvent(
			win,
			"change",
			async (evt: Event): Promise<void> => {
				const changeEl = evt.target as HTMLSelectElement;

				if (!changeEl?.id && !(changeEl instanceof HTMLSelectElement)) {
					return;
				}

				const selectedOption =
					changeEl.options[changeEl.selectedIndex].value;
				const selectId = changeEl.id;
				const NumberOfOptions = changeEl.options.length;

				const view = this.app.workspace.activeEditor;
				if (!view || !view.editor || !view.file) {
					return;
				}

				const options = changeEl.options;

				Array.from(options).map(({ value, text }) => {
					const option = createEl("option", {
						text,
						attr: {
							value,
							...(value === selectedOption && {
								selected: "selected",
							}),
						},
					});
					changeEl.appendChild(option);
				});

				for (let i = 1; i <= NumberOfOptions; i++) {
					changeEl.remove(0);
				}

				let page = await this.app.vault.read(view.file);

				page = page.replace(
					new RegExp(`<select id="${selectId}">[\\s\\S]*?</select>`),
					`${changeEl.outerHTML}`
				);

				this.app.vault.modify(view.file, page);
			}
		);
	};
}
