import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "./store";
import "./orders";
import { INGREDIENTS } from "../data/ingredients";
import type { Order } from "../types/market";

@customElement("curse-game")
export class GameElement extends LitElement {
	protected render(): HTMLTemplateResult {
		const ingredientIds = Object.keys(INGREDIENTS);
		const orders: Order[] = [
			{
				id: crypto.randomUUID(),
				customerId: "GUSTAVO",
				value: 50,
				ingredientIds: ["BLUE_PILL", "RED_PILL"]
			}
		];
	   	return html`
			<curse-orders .orders=${orders}></curse-orders>
			<curse-store .unlockedIngredientIds=${ingredientIds}></curse-store>
		`; 
	}

	public static styles?: CSSResultGroup = css`
		:host {
			display: grid;
			grid-template-columns: 1fr 3fr 1fr;
			grid-template-areas: "orders board store";

			height: 100%;
		}
		curse-store {
			grid-area: store;
		}
		curse-orders {
			grid-area: orders;
		}
	`;
}
