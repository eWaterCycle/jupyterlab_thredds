import { ObservableValue } from '@jupyterlab/observables';
import { Toolbar } from '@jupyterlab/apputils';
import { Widget, PanelLayout } from '@phosphor/widgets';

export class ThreddsFileBrowser extends Widget {
    listing: CatalogListing;
    toolbar: Toolbar<Widget>;
    _errorPanel: ThreddsErrorPanel | null;
    _changeGuard: boolean = false;
    baseUrl: ThreddsEditableBaseUrl;
    layout: PanelLayout;

    constructor() {
        super();
        this.title.label = 'THREDDS';
        this.id = 'thredds-file-browser';
        this.addClass('jp-ThreddsBrowser');
        this.layout = new PanelLayout();

        // Create an editiable name for Thredds server base url
        this.baseUrl = new ThreddsEditableBaseUrl('', '<Edit thredds catalog url>');
        this.baseUrl.node.title = 'Click to edit thredds catalog url';
        this.baseUrl.name.changed.connect(this._onBaseUrlChanged, this);
        this.layout.addWidget(this.baseUrl);

        this.listing = new CatalogListing();
        this.layout.addWidget(this.listing);


    }

    private _onBaseUrlChanged(sender: ObservableValue, args: ObservableValue.IChangedArgs) {
        if (this._changeGuard) {
            return;
        }
        this._changeGuard = true;
    }
}

export class CatalogListing extends Widget {
    container: HTMLElement;
    constructor() {
        super();
        this.buildContainer();
    }

    buildContainer() {
        this.container = document.createElement('ul');
        this.container.className = 'jp-CatalogListing';
        this.node.appendChild(this.container);
    }

    clearContainer() {
        this.node.removeChild(this.container);
    }

    onUpdateRequest() {
        this.clearContainer();
        this.buildContainer();


        const item = document.createElement('li');
        item.className = 'jp-CatalogItem';
        item.textContent = 'bla';
        this.container.appendChild(item);
    }
}

export class ThreddsEditableBaseUrl extends Widget {
    _pending = false;
    name: ObservableValue;
    _placeholder: string;
    _editNode: HTMLInputElement;
    _nameNode: HTMLDivElement;
    constructor(initialName: string = '', placeholder?: string) {
        super();
        this._nameNode = document.createElement('div');
        this._nameNode.className = "jp-editableUrl";
        this._editNode = document.createElement('input');

        this._placeholder = placeholder || '<Edit thredds server base url>';

        this.node.appendChild(this._nameNode);
        this.name = new ObservableValue(initialName);
        this._nameNode.textContent = initialName || this._placeholder;

        this.node.onclick = () => {
            if (this._pending) {
                return;
            }
            this._pending = true;
            Private.changeField(this._nameNode, this._editNode).then(value => {
                this._pending = false;
                if (this.name.get() !== value) {
                    this.name.set(value);
                }
            });
        };

        this.name.changed.connect((s, args) => {
            if (args.oldValue !== args.newValue) {
                this._nameNode.textContent =
                    args.newValue as string || this._placeholder;
            }
        });
    }
}

export class ThreddsErrorPanel extends Widget {
    constructor(message: string) {
        super();
        const image = document.createElement('div');
        const text = document.createElement('div');
        text.textContent = message;
        this.node.appendChild(image);
        this.node.appendChild(text);
    }
}

/**
 * A module-Private namespace.
 */
namespace Private {
    export
        /**
         * Given a text node and an input element, replace the text
         * node wiht the input element, allowing the user to reset the
         * value of the text node.
         *
         * @param text - The node to make editable.
         *
         * @param edit - The input element to replace it with.
         *
         * @returns a Promise that resolves when the editing is complete,
         *   or has been canceled.
         */
        function changeField(text: HTMLElement, edit: HTMLInputElement): Promise<string> {
        // Replace the text node with an the input element.
        let parent = text.parentElement as HTMLElement;
        let initialValue = text.textContent || '';
        edit.value = initialValue;
        parent.replaceChild(edit, text);
        edit.focus();

        // Highlight the input element
        let index = edit.value.lastIndexOf('.');
        if (index === -1) {
            edit.setSelectionRange(0, edit.value.length);
        } else {
            edit.setSelectionRange(0, index);
        }

        return new Promise<string>((resolve, reject) => {
            edit.onblur = () => {
                // Set the text content of the original node, then
                // replace the node.
                parent.replaceChild(text, edit);
                text.textContent = edit.value || initialValue;
                resolve(edit.value);
            };
            edit.onkeydown = (event: KeyboardEvent) => {
                switch (event.keyCode) {
                    case 13:  // Enter
                        event.stopPropagation();
                        event.preventDefault();
                        edit.blur();
                        break;
                    case 27:  // Escape
                        event.stopPropagation();
                        event.preventDefault();
                        edit.value = initialValue;
                        edit.blur();
                        break;
                    default:
                        break;
                }
            };
        });
    }
}