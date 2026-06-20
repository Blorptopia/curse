import { type HTMLTemplateResult, LitElement, html, type CSSResultGroup, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IngredientId } from "../types/ingredient";

const INGREDIENT_TO_IMAGES = {
	BLUE_PILL: ""
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
			<img src=${imageUrl} alt="">
		`;
	}

	public static styles?: CSSResultGroup = css`
		img {
			height: 100%;
			width: 100%;
			aspect-ratio: 1;
		}
	`;
}
