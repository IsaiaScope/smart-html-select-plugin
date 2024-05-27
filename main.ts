import { Plugin, WorkspaceWindow } from "obsidian";
import { InsertSelectModal } from "./modal";

export default class SelectOnFirePlugin extends Plugin {
	commandName = "Insert HTML select";

	async onload() {
		this.app.workspace.on("window-open", this.setupWindowHandlers);
		this.setupWindowHandlers(undefined as never, activeWindow);
		const onSubmit = (optionNumber: number, emptyOption: boolean) => {
			this.createSelect(optionNumber, emptyOption);
		};

		this.addRibbonIcon("flame", this.commandName, () => {
			new InsertSelectModal(this.app, 5, onSubmit).open();
		});

		this.addCommand({
			id: "insert-html-select",
			name: this.commandName,
			editorCallback: () => {
				new InsertSelectModal(this.app, 5, onSubmit).open();
			},
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

				const view = this.app.workspace.activeEditor;
				if (!view || !view.editor || !view.file) {
					return;
				}

				const options = changeEl.options;

				const newOptions = Array.from(options)
					.map(({ value, text }) => {
						const selectedAttr =
							value === selectedOption
								? 'selected="selected"'
								: "";
						return `<option value="${value}" ${selectedAttr}>${text}</option>`;
					})
					.join("");
				const newSelect = `<select id="${selectId}">${newOptions}</select>`;

				let page = await this.app.vault.read(view.file);

				page = page.replace(
					new RegExp(`<select id="${selectId}">[\\s\\S]*?</select>`),
					`${newSelect}`
				);

				this.app.vault.modify(view.file, page);
			}
		);
	};

	private createSelect(optionNumber: number, emptyOption: boolean) {
		const view = this.app.workspace.activeEditor;

		if (!view?.editor) {
			return;
		}
		const randomId = this.generateUniqueId(view.editor.getDoc().getValue());
		const emptyOptionString = emptyOption
			? `<option value="0"></option>`
			: "";
		const select = `<select id="${randomId}">${emptyOptionString}${Array.from(
			{ length: optionNumber },
			(_, i) => `<option value="${i + 1}">option ${i + 1}</option>`
		).join("")}</select>`;

		view.editor.replaceSelection(select);
	}
}
