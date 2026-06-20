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
			<div class="ingredient">
				<curse-ingredient-icon .ingredientId=${ingredientId}></curse-ingredient-icon>
				<span class="title">${info.name}</span>
				<span class="price">${info.price}$</span>
			</div>
		`;
	}
	public static styles?: CSSResultGroup = css`
		:host {
			background: brown;
			padding: 1rem;
		}
		#ingredients {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;
		}

		.ingredient {
			position: relative;
		}
		.price {
			position: absolute;
			right: .1rem;
			bottom: 1.1rem;
			color: green;
		}

		curse-ingredient-icon {
			display: block;
			--size: 4rem;
			height: var(--size);
			width: var(--size);
		}
	`;
}
