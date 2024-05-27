import { App, Modal, Setting } from "obsidian";

export class InsertSelectModal extends Modal {
	optionNumber: number;
	emptyOption: boolean;

	onSubmit: (optionNumber: number, emptyOption: boolean) => void;

	constructor(
		app: App,
		defaultNumber: number,
		onSubmit: (optionNumber: number, emptyOption: boolean) => void
	) {
		super(app);
		this.optionNumber = defaultNumber;
		this.emptyOption = true;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", {
			text: "How many select options do you need ?",
		});

		new Setting(contentEl)
			.setName("Number of options (max: 25)")
			.addText((text) =>
				text.setValue(`${this.optionNumber}`).onChange((value) => {
					this.optionNumber = Number(value);

					if (
						isNaN(this.optionNumber) ||
						this.optionNumber <= 1 ||
						this.optionNumber > 25
					) {
						button.setDisabled(true);
					} else {
						button.setDisabled(false);
					}
				})
			);

		new Setting(contentEl)
			.setName("Add an empty option")
			.addToggle((cb) => {
				cb.setValue(true)
					.setTooltip(
						"Enabling this will add an empty option at the top of the select list."
					)
					.onChange((value) => {
						this.emptyOption = value;
					});
			});

		const button = new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Add Select")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.optionNumber, this.emptyOption);
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
