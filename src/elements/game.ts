import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";
import "./orders";
import "./mixing_screen";
import { INGREDIENTS } from "../data/ingredients";
import type { Order } from "../types/market";

@customElement("curse-game")
export class GameElement extends LitElement {
	// Elements
	@query(`[data-screen="orders"]`)
	private ordersScreenElement?: HTMLElement;
	@query(`[data-screen="mixing"]`)
	private mixingScreenElement?: HTMLElement;

	protected render(): HTMLTemplateResult {
		const ingredientIds = Object.keys(INGREDIENTS);
		const orders: Order[] = [
			{
				id: crypto.randomUUID(),
				name: "Genius potion",
				description: "My wife keeps winning at trivia and maths, please make me a genius potion.",
				customerId: "JACK",
				value: 50,
				targetColor: "#00ffff",
			}
		];
	   	return html`
			<div id="screens">
				<div class="screen-container" data-screen="orders">
					<button id="go-to-mixing-screen" class="navigation-button" @click=${() => this.gotoScreen("mixing")}>&gt;</button>
					<curse-orders
						.orders=${orders}
					></curse-orders>
				</div>
				<div class="screen-container" data-screen="mixing">
					<button id="go-to-orders" class="navigation-button" @click=${() => this.gotoScreen("orders")}>&lt;</button>
					<curse-mixing-screen
						.unlockedIngredientIds=${ingredientIds}
					></curse-mixing-screen>
				</div>
			</div>
		`; 
	}

	private gotoScreen(screen: Screen): void {
		console.log(`navigating to ${screen}`);
		if (screen === "mixing") {
			if (this.mixingScreenElement === undefined) {
				throw new Error("cannot navigate - element not defined");
			}
			this.mixingScreenElement.scrollIntoView({behavior: "smooth"});
		}
		if (screen === "orders") {
			if (this.ordersScreenElement === undefined) {
				throw new Error("cannot navigate - element not defined");
			}
			this.ordersScreenElement.scrollIntoView({behavior: "smooth"});
		}
		
	}

	public static styles?: CSSResultGroup = css`
		:host {
			display: block;
			height: 100%;
			width: 100%;
			overflow: hidden;
		}
		#screens {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			width: 200%;
			height: 100%;
		}
		.screen-container {
			display: block;
			position: relative;
			width: 100%;
		}
		curse-store {
			grid-area: store;
		}
		curse-orders {
			grid-area: orders;
		}
		.navigation-button {
			position: absolute;
			top: 0.1rem;

			font-size: 2rem;
		}
		#go-to-orders-screen {
			left: 0.1rem;
		}
		#go-to-mixing-screen {
			right: 0.1rem;
		}
	`;
}

type Screen = "mixing" | "orders";
