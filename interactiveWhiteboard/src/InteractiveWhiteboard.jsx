import { Component, createElement } from "react";

import { TlDrawComponent } from "./components/TlDrawComponent";
import "./ui/InteractiveWhiteboard.css";

export class InteractiveWhiteboard extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TlDrawComponent
                whiteboardBorder={this.props.whiteboardBorder}
                bootstrapStyle={this.props.bootstrapStyle}
				whiteboardMode={this.props.whiteboardMode}
				disablePages={this.props.disablePages}
                className={this.props.class}
                style={this.props.style}
				widthUnit={this.props.widthUnit}
				width={this.props.width}
				heightUnit={this.props.heightUnit}
				height={this.props.height}
				allowResize={this.props.allowResize}
				restrictResize={this.props.restrictResize}
				readWhiteboard={this.props.valueAttribute.readOnly}
				value={this.props.valueAttribute} 
				updateType={this.props.autoUpdate}
				snapshotSaveButton={this.props.snapshotSave}
				snapshotLoadButton={this.props.snapshotLoad}
				updateInterval={this.props.updateInterval}
				keepTools={this.props.keepTools}
				/>
        );
    }
}
