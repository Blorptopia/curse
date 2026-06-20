import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "./ingredients";
import { INGREDIENTS } from "../data/ingredients";

@customElement("curse-game")
export class GameElement extends LitElement {
	protected render(): HTMLTemplateResult {
		const ingredientIds = Object.keys(INGREDIENTS);
	   	return html`
			<curse-ingredients .ingredientIds=${ingredientIds}></curse-ingredients>
		`; 
	}

	public static styles?: CSSResultGroup = css`
		:host {
			display: grid;
			grid-template-columns: 1fr 3fr 1fr;
			grid-template-areas: "market board ingredients";
		}
		curse-ingredients {
			grid-area: ingredients;
		}
	`;
}
