import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import CupURL from "../assets/cup.png";
import type { PlaceItemData } from "../types/place";

@customElement("curse-cup")
export class CupElement extends LitElement {
	@property({type: Boolean})
	public shouldBeDraggable: boolean;

	// Elements
	@query("img")
	private imageElement?: HTMLImageElement;

	public constructor() {
		super();
		this.shouldBeDraggable = true;
	}
	protected render(): HTMLTemplateResult {
	   	return html`
			<img
				src=${CupURL}
				.draggable=${this.shouldBeDraggable}
				alt=""
				@dragstart=${(event: DragEvent) => {
					if (!this.shouldBeDraggable) {
						return;
					}
					const imageElement = this.imageElement!;
					const rect = imageElement.getBoundingClientRect();
					const payload: PlaceItemData = {
						itemId: "SOLO_CUP",
						sizePixels: {
							height: rect.height,
							width: rect.width
						}
					};
					event.dataTransfer!.setData("curse/item", JSON.stringify(payload));
				}}
			>
		`; 
	}
	public static styles?: CSSResultGroup = css`
		:host {
			display: block;
			--source-height: 45;
			--source-width: 28;
			height: calc(var(--source-height) * var(--size-multiplier));
			width: calc(var(--source-width) * var(--size-multiplier));

			user-select: none;
		}
		img {
			display: block;
			height: 100%;
			width: 100%;
			object-fit: contain;
			object-position: bottom center;

			image-rendering: pixelated;
		}
	`;
}
