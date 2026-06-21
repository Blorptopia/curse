import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement } from "lit/decorators.js";
import "./customer_portrait";
import "./hot_plate";
import "./cup";
import "./ingredient_icon";

@customElement("curse-game")
export class GameElement extends LitElement {
	protected render(): HTMLTemplateResult {
	    return html`
			<section id="window-frame">
				<div id="left-window" class="window"></div>
				<div id="right-window" class="window"></div>

				<div id="customer-container">
					<curse-customer-portrait class="i-hate-images" customerid="JACK"></curse-customer-portrait>
				</div>
				<div id="hot-plate-container">
					<curse-hot-plate class="i-hate-images"></curse-hot-plate>
				</div>
			</section>
			<section id="shelf">
				<div id="essentials-row" class="shelf-row">
					<curse-cup class="i-hate-images"></curse-cup>
				</div>
				<div id="ingredients-row" class="shelf-row">
					<curse-ingredient-icon ingredientid="BLUE_PILL"></curse-ingredient-icon>
					<curse-ingredient-icon ingredientid="RED_PILL"></curse-ingredient-icon>
				</div>
			</section>
		`
	}
	public static styles?: CSSResultGroup = css`
		#window-frame {
			border: 2rem solid #775079;
			
			height: 100%;
			box-sizing: border-box;
		}
		.window {
			position: absolute;
			z-index: -50;
			top: 0;
			background: #ffffff55;
			border-color: #ffffff99;
			height: 100%;
			width: 15%;
			border-width: .2rem;
		}
		#left-window {
			border-right-style: solid;
			left: 0;
		}
		#right-window {
			border-left-style: solid;
			right: 0;
		}
		#shelf {
			background: #775079;
			padding: 1rem;

			display: flex;
			flex-direction: column;
			gap: 1rem;
		}
		.shelf-row {
			background: #a15d7b;
			padding: 1rem;
			width: 100%;
			box-sizing: border-box;

			display: flex;
			gap: 1rem;
		}
		.i-hate-images {
			height: calc(var(--source-height) * var(--size-multiplier));
			width: calc(var(--source-width) * var(--size-multiplier));
		}
		#customer-container {
			position: absolute;
			bottom: 0rem;
			width: 100%;
			overflow-y: hidden;
			z-index: -100;

			display: flex;
			justify-content: center;

			curse-customer-portrait {
				--size-multiplier: .35rem;
				anchor-name: --customer;
			}
		}
		#hot-plate-container {
			position: absolute;
			left: 0;
			bottom: 1rem;
			width: 100%;

			display: flex;
			justify-content: center;

			curse-hot-plate {
				--size-multiplier: .17rem;
			}
		}
		#cup-on-table-container {
			position: absolute;
			bottom: 1rem;
			left: .5rem;
		}
		curse-cup {
			--size-multiplier: .14rem;
		}
		curse-ingredient-icon {
			--size-multiplier: 0.08rem;
		}
	`;
}
