/* eslint-disable prettier/prettier */
import { Component, createElement } from "react";
import classNames from "classnames";
import {
	Tldraw,
	useIsToolSelected,
	useTools,
	getSnapshot, 
	loadSnapshot,
	useEditor,
	setUserPreferences,
	createTLStore
} from "tldraw";
import { debounce } from "lodash";
import 'tldraw/tldraw.css';


function EditorWrapper({ children }) {
  const editor = useEditor();
  return children(editor);
}

// SnapshotToolbar Component (Class-based)
class SnapshotToolbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// Will visually show user that whiteboard is saved
			showCheckMark: false,
			jsonSnapshot: this.props.whiteboardProps.value || "",
			};
		this.save = this.save.bind(this);
		this.load = this.load.bind(this);
	}
  
  // Save whiteboard
	save() {
		const { editor, whiteboardProps } = this.props;
		if (!editor || !editor.store) {
			console.error('Editor instance is not available.');
			return;
		}
		const { document, session } = getSnapshot(editor.store);
		
		if (!document) {
			console.error('Document instance is not available.');
			return;
		}
		const newValue = JSON.stringify({ document, session });		
		
		// Update local state to trigger Mendix object save
		this.setState({ jsonSnapshot: newValue }, () => {
			console.log("Whiteboard JSON being updated manually");	
			
		});
	  }
	  
	// Load snapshot
	load() {
		const { editor, whiteboardProps, jsonSnapshot } = this.props; // Use editor from props
		const snapshot = whiteboardProps.value;
		if (!snapshot) {
			console.error('Refresh failed. Snapshot instance is not available.');
			return;
		}				
		const snapshotCheck = whiteboardProps.value.value;	
		loadSnapshot(editor.store, JSON.parse(snapshotCheck));
	}
		  
	// Handle checkmark visibility
	componentDidUpdate(_, prevState) {
		if (this.state.showCheckMark && !prevState.showCheckMark) {
			this.checkMarkTimeout = setTimeout(() => {
				this.setState({ showCheckMark: false });
				// Setting value in save function causes checkmark to not render
				// so setting value has to be set here so re-render is not interrupted
				this.props.whiteboardProps.value.setTextValue(this.state.jsonSnapshot);
				}, 1200);
			}
	}
	
	render() {
		const { showCheckMark } = this.state;
		const { snapshotSaveButton, snapshotLoadButton, bootstrapStyle, readWhiteboard, updateType } = this.props;
		let saveButton, loadButton;
		
		// Assumes if whiteboard is in read only mode, buttons are not required
		if (updateType === "manual_update" && snapshotLoadButton && readWhiteboard==false) {
			loadButton = <button className={classNames("btn", "btn-"+bootstrapStyle)} onClick={this.load}>Reset</button>;
		}
		
		if (updateType === "manual_update" && snapshotSaveButton && readWhiteboard==false) {
			saveButton = ( 
			<button className={classNames("btn", "btn-"+bootstrapStyle)}

			  onClick={() => {
				this.save();
				this.setState({ showCheckMark: true });
				}}
			>Update</button>
			);
		}

		return (
		  <div style={{ padding: 20, pointerEvents: 'all', display: 'flex', gap: '10px' }}>
			<span
			  style={{
				display: 'inline-block',
				transition: 'transform 0.2s ease, opacity 0.2s ease',
				transform: showCheckMark ? `scale(1)` : `scale(0.5)`,
				opacity: showCheckMark ? 1 : 0,
			  }}
			>
			  Updated ✅
			</span>
			{saveButton}
			{loadButton}
		  </div>
		);
	}
}


export class TlDrawComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			jsonSnapshot: this.props.value,
		};
		
		this.displayMode = this.props.whiteboardMode === "whiteboard_darkmode" ? "dark" : "light";
		
		this.userPreferences = {
			id: "Mendix-user",  // Identifier for the user
			colorScheme: this.displayMode, // Enables dark mode
		};
		this.mxObject = this.props.mxObject;

		if(this.props.updateInterval < 100 && this.props.updateType === "auto_update") {
			console.warn("Update interval cannot be less than 100ms. Defaulting to 1000ms");
			this.props.updateInterval = 1000;
		}
	}
	
	getStyle(value, type) {
		// When type is auto default browser styles applies
		if (type === "pixels") {
			return value;
		} else if (type === "percentage") {
			return value + "%";
		}
		return "";
	}
	
	handleEditorMount = (editor) => {
		this.editor = editor
		
		if (!editor || !editor.store) {
			console.error('Editor or store not available in onMount');
			return;
		}
		
		// Load previously selected tool
		if(this.props.keepTools) {
			const savedTool = localStorage.getItem('selected-tool')
			if (savedTool) {
				editor.setCurrentTool(savedTool)
			}
		}
		
		this.cleanupFn = editor.store.listen(
			debounce(() => {
				const { document, session } = getSnapshot(editor.store)

				if (!document || !session) {
					console.error('Snapshot is incomplete.')
					return
				}
				
				setTimeout(() => {
					// Save tool on change
					if(this.props.keepTools) {
						const currentTool = editor.getCurrentToolId()
						localStorage.setItem('selected-tool', currentTool)
					}
					// Setting value will cause whiteboard to re render
					const newValue = JSON.stringify({ document, session })
					this.props.value.setValue(newValue)
				}, 100)
			}, this.props.updateInterval)
		)			
	}
		
		
	
	componentWillUnmount() {
		clearTimeout(this.checkMarkTimeout);
		if (this.cleanupFn?.cancel) {
			this.cleanupFn.cancel(); // important for debounce/throttle
		}
		// Stops selected tool from presisting across app pages
		const savedTool = localStorage.getItem('selected-tool')
			if (savedTool) {
				localStorage.removeItem('selected-tool');
			}
	}	
	
    render() {
		let initialJSON = "";
		if(this.props.value.value !== undefined && this.props.value.value) {
			initialJSON = JSON.parse(this.props.value.value);
		}
		let maxPagesInt = 1;
		if(!this.props.disablePages){
			maxPagesInt = 20;
		}		
		
        return (
            <div className={classNames(this.props.whiteboardBorder, "tl-span-container", "alert-"+this.props.bootstrapStyle, this.props.restrictResize, this.props.allowResize)}
				style={{
					height: this.getStyle(this.props.height,this.props.heightUnit),
					width: this.getStyle(this.props.width,this.props.widthUnit)
            }}	
			>
				<Tldraw 
					style={{ touchAction: "none" }} // Prevents touch gestures from interfering
					onPointerDown={(e) => e.stopPropagation()} // Ensures events go to Tldraw
					performanceMode="high"
						
					snapshot={initialJSON}
					options={{ maxPages: maxPagesInt }}
						
					components={{						
						SharePanel: () => (
						  <EditorWrapper>
							{(editor) => (
								<SnapshotToolbar
								editor={editor}
								whiteboardProps={this.props}
								bootstrapStyle={this.props.bootstrapStyle}	
								jsonSnapshot={this.state.jsonSnapshot} // Pass jsonSnapshot from state
								updateType={this.props.updateType}
								snapshotLoadButton={this.props.snapshotLoadButton}
								snapshotSaveButton={this.props.snapshotSaveButton}
								readWhiteboard={this.props.readWhiteboard}
							/>
							)}
						  </EditorWrapper>
						),
					}}

				
					onMount={(editor) => {
						window.editor = editor;  // Make editor accessible globally
						
						editor.updateInstanceState({ isReadonly: this.props.readWhiteboard });
						setUserPreferences(this.userPreferences);
						const toolbarClass = "btn-" + this.props.bootstrapStyle;
						const menubarClass = "btn-" + this.props.bootstrapStyle;
    
						// Function to add class if missing
						const applyClass = () => {
							// Loops in case there are multiple whiteboards
							document.querySelectorAll(".tlui-toolbar__tools").forEach(toolbar => {
								if (!toolbar.classList.contains(toolbarClass)) {
									toolbar.classList.add(toolbarClass);
								}
							});
							
							document.querySelectorAll(".tlui-menu-zone").forEach(menubar => {
								if (!menubar.classList.contains(menubarClass)) {
									menubar.classList.add(menubarClass);
								}
							});
						};
						// Apply class initially
						applyClass();
						
						if(this.props.updateType === "auto_update") {
							this.handleEditorMount(editor);
						}

						// Watch for changes in the toolbar and re-apply class if removed
						// class may be removed if whiteboard is resized
						const observer = new MutationObserver(applyClass);
						observer.observe(document.body, { childList: true, subtree: true });
						// Cleanup observer on unmount
						return () => observer.disconnect();
					}}
				/>
            </div>
        );
    }
}
