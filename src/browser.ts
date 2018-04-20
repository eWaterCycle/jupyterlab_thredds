import {
    PanelLayout, Widget
} from '@phosphor/widgets';
import { FileBrowser } from '@jupyterlab/filebrowser';
import { ThreddsDrive } from './contents';
import { ObservableValue } from '@jupyterlab/observables';

export class ThreddsFileBrowser extends Widget {
    _errorPanel: ThreddsErrorPanel | null;
    _changeGuard: boolean = false;
    baseUrl: ThreddsEditableBaseUrl;
    _drive: ThreddsDrive;
    _browser: FileBrowser;
    constructor(browser: FileBrowser, drive: ThreddsDrive) {
        super();
        this.addClass('jp-ThreddsBrowser');
        this.layout = new PanelLayout();
        (this.layout as PanelLayout).addWidget(browser);
        this._browser = browser;
        this._drive = drive;

        // Create an editiable name for Thredds server base url
        this.baseUrl = new ThreddsEditableBaseUrl('', '<Edit thredds catalog url>');
        this.baseUrl.node.title = 'Click to edit thredds catalog url';
        this._browser.toolbar.addItem('base', this.baseUrl);
        this.baseUrl.name.changed.connect(this._onBaseUrlChanged, this);
    }

    private _onBaseUrlChanged(sender: ObservableValue, args: ObservableValue.IChangedArgs) {
        if (this._changeGuard) {
            return;
        }
        this._changeGuard = true;
        this._drive.baseUrl = args.newValue as string;
        this._browser.model.cd('/').then(() => {
            this._changeGuard = false;
            this._updateErrorPanel();
            // Once we have the new listing, maybe give the file listing
            // focus. Once the input element is removed, the active element
            // appears to revert to document.body. If the user has subsequently
            // focused another element, don't focus the browser listing.
            if (document.activeElement === document.body) {
                const listing = (this._browser.layout as PanelLayout).widgets[2];
                listing.node.focus();
            }
        });
    }

    private _updateErrorPanel(): void {
        // If we currently have an error panel, remove it.
        if (this._errorPanel) {
            const listing = (this._browser.layout as PanelLayout).widgets[2];
            listing.node.removeChild(this._errorPanel.node);
            this._errorPanel.dispose();
            this._errorPanel = null;
        }

        // TODO report when baseUrl promise fails
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