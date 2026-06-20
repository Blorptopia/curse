import { css, html, type HTMLTemplateResult, LitElement, type CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IngredientId } from "../types/ingredient";
import "./store";

@customElement("curse-mixing-screen")
export class MixingScreenElement extends LitElement {
	@property({type: Array})
	public unlockedIngredientIds: IngredientId[];

	public constructor() {
		super();
		this.unlockedIngredientIds = [];
	}
	protected render(): HTMLTemplateResult {
	   	return html`
			<div></div>
			<curse-store .unlockedIngredientIds=${this.unlockedIngredientIds}></curse-store>
		`; 
	}
	static styles?: CSSResultGroup = css`
		:host {
			display: grid;
			grid-template-columns: 3fr 1fr;

			height: 100%;
		}
	`;
}
