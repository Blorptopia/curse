import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement } from "lit/decorators.js";
import HotPlateURL from "../assets/hot_plate.png";

@customElement("curse-hot-plate")
export class HotPlateElement extends LitElement {
	protected render(): HTMLTemplateResult {
	   	return html`
			<img
				src=${HotPlateURL}
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
		}
		img {
			display: block;
			height: 100%;
			width: 100%;
			object-fit: contain;
			object-position: bottom center;

			image-rendering: pixelated;
		}
	`;
}
