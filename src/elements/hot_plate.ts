import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import HotPlateURL from "../assets/hot_plate/base.png";
import HotPlateUnpressedButtonURL from "../assets/cup.png";
import HotPlatePressedButtonURL from "../assets/cup.png";

@customElement("curse-hot-plate")
export class HotPlateElement extends LitElement {
	@state()
	private pressed: boolean;

	public constructor() {
		super();
		this.pressed = false;
	}

	protected render(): HTMLTemplateResult {
	   	return html`
			<img
				class="base"
				src=${HotPlateURL}
				alt
				@mousedown=${() => {
					this.pressed = true;
				}}
				@mouseup=${() => {
					this.pressed = false;
				}}
				@touchstart=${() => {
					this.pressed = true;
				}}
				@touchend=${() => {
					this.pressed = false;
				}}
			>
			<img
				?data-pressed=${this.pressed}
				class="button"
				src=${this.pressed ? HotPlatePressedButtonURL : HotPlateUnpressedButtonURL}
				alt
			>
		`; 
	}
	public static styles?: CSSResultGroup = css`
		:host {
			display: block;
			--source-height: 61;
			--source-width: 196;
			height: calc(var(--source-height) * var(--size-multiplier));
			width: calc(var(--source-width) * var(--size-multiplier));

			position: relative;
		}
		.base {
			cursor: pointer;
		}
		img {
			display: block;
			height: 100%;
			width: 100%;

			object-fit: contain;
			object-position: bottom center;

			image-rendering: pixelated;
		}
		.button {
			position: absolute;
			top: 0;
			left: 0;
			pointer-events: none;
		}
		.button[data-pressed] {
			background: red;
		}
	`;
}
