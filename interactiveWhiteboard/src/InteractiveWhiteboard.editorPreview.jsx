import { Component, createElement } from "react";

import { parseInlineStyle } from "@mendix/pluggable-widgets-tools";

import { TlDrawComponent } from "./components/TlDrawComponent";

export class preview extends Component {
    render() {
        return (
            <div ref={this.parentInline}>
                <TlDrawComponent {...this.transformProps(this.props)}></TlDrawComponent>
            </div>
        );
    }

    parentInline(node) {
        // Temporary fix, the web modeler add a containing div, to render inline we need to change it.
        if (node && node.parentElement && node.parentElement.parentElement) {
            node.parentElement.parentElement.style.display = "inline-block";
        }
    }

    transformProps(props) {
        return {
			whiteboardBorder: props.whiteboardBorder,
            bootstrapStyle: props.bootstrapStyle,
			whiteboardMode: props.whiteboardMode,
			disablePages: props.disablePages,
            className: props.className,
			style: parseInlineStyle(props.style),
			widthUnit: props.widthUnit,
			width: props.width,
			heightUnit: props.heightUnit,
			height: props.height,
			allowResize: props.allowResize,
			restrictResize: props.restrictResize,
			readWhiteboard: props.valueAttribute.readOnly,
			value: props.valueAttribute,
			updateType: props.autoUpdate,
			snapshotSaveButton: props.snapshotSave,
			snapshotLoadButton: props.snapshotLoad,
			updateInterval: props.updateInterval,
			keepTools: props.keepTools
        };
    }
}

export function getPreviewCss() {
    return require("./ui/InteractiveWhiteboard.css");
}

