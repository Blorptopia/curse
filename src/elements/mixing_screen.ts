import { css, html, type HTMLTemplateResult, LitElement, type CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { IngredientId } from "../types/ingredient";
import "./store";
import "./hot_plate";

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
			<curse-store .unlockedIngredientIds=${this.unlockedIngredientIds}></curse-store>
			<div id="hot-plate-container">
				<curse-hot-plate></curse-hot-plate>
			</div>
		`; 
	}
	static styles?: CSSResultGroup = css`
		:host {
			position: relative;

			display: block;
			height: 100%;
			width: 100%;
		}
		curse-store {
			position: absolute;
			width: 25%;
			height: 100%;
			box-sizing: border-box;
			right: 0;
		}
		#hot-plate-container {
			position: absolute;
			bottom: 0;
			width: 100%;

			display: flex;
			justify-content: center;

			padding: 1rem;
		}
	`;
}
