import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { IngredientId } from "../types/ingredient";
import { INGREDIENTS } from "../data/ingredients";
import "./ingredient-icon";

@customElement("curse-ingredients")
export class IngredientsElement extends LitElement {
	@property({type: Array})
	public ingredientIds: IngredientId[];

	public constructor() {
		super();
		this.ingredientIds = [];
	}

	protected render(): HTMLTemplateResult {
	   	return html`
			<h1>Ingredients</h1>
			<div id="ingredients">
				${repeat(this.ingredientIds, id => id, id => this.renderIngredient(id))}
			</div>
		`; 
	}
	private renderIngredient(ingredientId: IngredientId): HTMLTemplateResult {
		const info = INGREDIENTS[ingredientId];
		return html`
			<div id="ingredient">
				<span class="title">${info.name}</span>
				<curse-ingredient-icon .ingredientId=${ingredientId}></curse-ingredient-icon>
			</div>
		`;
	}
	public static styles?: CSSResultGroup = css`
		#ingredients {
			display: flex;
			flex-wrap: wrap;
		}

		curse-ingredient-icon {
			display: block;
			--size: 4rem;
			height: var(--size);
			width: var(--size);
		}
	`;
}
