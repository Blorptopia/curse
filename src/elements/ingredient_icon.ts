import { type HTMLTemplateResult, LitElement, html, type CSSResultGroup, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { IngredientId } from "../types/ingredient";
import BurgerURL from "../assets/ingredients/burger.png";
import FlatBurgerURL from "../assets/ingredients/flat_burger.png";
import type { PlaceIngredientData } from "../types/place";

const INGREDIENT_TO_IMAGES = {
	BLUE_PILL: "",
	RED_PILL: "",
	BURGER: BurgerURL,
	FLAT_BURGER: FlatBurgerURL
} satisfies Record<IngredientId, string>;

@customElement("curse-ingredient-icon")
export class IngredientIconElement extends LitElement {
	@property({type: String})
	public ingredientId: IngredientId;
	@property({type: Boolean})
	public shouldBeDraggable: boolean;

	// Elements
	@query("img")
	private imageElement?: HTMLImageElement;

	public constructor() {
		super();
		this.shouldBeDraggable = true;
		this.ingredientId = "BLUE_PILL";
	}
	protected render(): HTMLTemplateResult {
		const imageUrl = INGREDIENT_TO_IMAGES[this.ingredientId];
	   	return html`
			<img
				src=${imageUrl}
				.draggable=${this.shouldBeDraggable}
				alt=""
				@dragstart=${(event: DragEvent) => {
					if (!this.shouldBeDraggable) {
						return;
					}
					const imageElement = this.imageElement!;
					const rect = imageElement.getBoundingClientRect();
					const payload: PlaceIngredientData = {
						ingredientId: this.ingredientId,
						sizePixels: rect.height
					};
					event.dataTransfer!.setData("curse/ingredient", JSON.stringify(payload));
				}}
			>
		`;
	}

	public static styles?: CSSResultGroup = css`
		:host {
			display: block;
			--source-height: 100;
			--source-width: 100;
			height: calc(var(--source-height) * var(--size-multiplier));
			width: calc(var(--source-width) * var(--size-multiplier));

			user-select: none;
		}
		img {
			display: block;
			height: 100%;
			width: 100%;
			object-fit: contain;
			object-position: center center;

			image-rendering: pixelated;
		}
	`;
}
