import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement } from "lit/decorators.js";
import CupURL from "../assets/cup.png";

@customElement("curse-cup")
export class CupElement extends LitElement {
	protected render(): HTMLTemplateResult {
	   	return html`
			<img
				src=${CupURL}
				draggable="false"
				alt
			>
		`; 
	}
	public static styles?: CSSResultGroup = css`
		:host {
			display: block;
			--source-height: 45;
			--source-width: 28;
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
