import { type HTMLTemplateResult, LitElement, html, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IngredientId } from "../types/ingredient";
import BurgerURL from "../assets/ingredients/burger.png";

const INGREDIENT_TO_IMAGES = {
	BLUE_PILL: "",
	RED_PILL: "",
	BURGER: BurgerURL
} satisfies Record<IngredientId, string>;

@customElement("curse-ingredient-icon")
export class IngredientIconElement extends LitElement {
	@property({type: String})
	public ingredientId: IngredientId;

	public constructor() {
		super();
		this.ingredientId = "BLUE_PILL";
	}
	protected render(): HTMLTemplateResult {
		const imageUrl = INGREDIENT_TO_IMAGES[this.ingredientId];
	   	return html`
			<img
				src=${imageUrl}
				?draggable=${this.draggable}
				alt=""
				@dragstart=${(event: DragEvent) => {
					event.dataTransfer!.setData("curse/ingredient", this.ingredientId);
					console.log(event.dataTransfer!.types);
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
