import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "./ingredients";
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
				ingredientIds: ["BLUE_PILL"]
			}
		];
	   	return html`
			<curse-orders .orders=${orders}></curse-orders>
			<curse-ingredients .ingredientIds=${ingredientIds}></curse-ingredients>
		`; 
	}

	public static styles?: CSSResultGroup = css`
		:host {
			display: grid;
			grid-template-columns: 1fr 3fr 1fr;
			grid-template-areas: "orders board ingredients";

			height: 100%;
		}
		curse-ingredients {
			grid-area: ingredients;
		}
		curse-orders {
			grid-area: orders;
		}
	`;
}
