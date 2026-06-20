import { html, type HTMLTemplateResult, LitElement, type CSSResultGroup, css } from "lit";
import { customElement } from "lit/decorators.js";
import HotPlateURL from "../assets/hot_plate.png";
import { styleMap } from "lit/directives/style-map.js";
import { HOT_PLATE_SIZE } from "../config";

@customElement("curse-hot-plate")
export class HotPlateElement extends LitElement {
	protected render(): HTMLTemplateResult {
	   	return html`
			<img
				id="hot-plate"
				src=${HotPlateURL}
				alt
				usemap="#hot-plate-map"
				style=${styleMap({
					"--source-height": HOT_PLATE_SIZE.height,
					"--source-width": HOT_PLATE_SIZE.width
				})}
			>
			<map id="hot-plate-map">
				<area
					shape="circle"
					coords="260,50,30"
					@click=${() => {
						console.log("activating hotplate");
					}}
				>
			</map>
		`; 
	}
	public static styles?: CSSResultGroup = css`
		#hot-plate {
			--size-multiplier: .1rem;
			height: calc(var(--source-height) * var(--size-multiplier));
			width: calc(var(--source-width) * var(--size-multiplier));
		}
		area:hover {
			cursor: pointer;
		}
	`;
}
