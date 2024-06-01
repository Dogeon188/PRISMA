
import {
    Canvas,
    Component,
    director,
    ImageAsset,
    Label,
    Vec3,
    Layers,
    Node,
    Sprite,
    SpriteFrame,
    Texture2D,
    tween,
    _decorator,
    UITransform,
    log,
    } from "cc";

const { ccclass, property } = _decorator

@ccclass("Toast")
export class Toast extends Component{
    static readonly LENGTH_SHORT = 2;
    static readonly LENGTH_LONG = 3.5;

    private toastText: Node = null;
    private background: Node = null;
    private _lineHeight: number = 0;
    private _textSize: number = 0;
    private _duration: number = 0;
    private canvas: Canvas = null;
    private canvasUiTransform: UITransform = null;
    private toastUiTransform: UITransform = null;
    private backgroundUiTransform: UITransform = null;

    protected start(): void {
        this.toastText = this.node.getChildByName("ToastText");
        this.background = this.node.getChildByName("Background");
        this.toastUiTransform = this.toastText.getComponent(UITransform);
        this.backgroundUiTransform = this.background.getComponent(UITransform);
        this._lineHeight = this.toastText.getComponent(Label).lineHeight;
        this._textSize = this.toastText.getComponent(Label).fontSize;
        this.node.active = false;
    }
    /**
     * Set the background size of the toast
     * @param width
     * @param height
     * @returns
     */
    setBackgroundSize(width: number, height: number): void {
        this.backgroundUiTransform.width = width;
        this.backgroundUiTransform.height = height;
    }

    setTextSize(size: number): void {
        this.toastText.getComponent(Label).fontSize = size;
        this._textSize = size;
    }

    setLineHeight(height: number): void {
        this.toastText.getComponent(Label).lineHeight = height;
    }

    setText(text: string): void {
        if(this.toastText ==  null) {
            this.toastText = this.node.getChildByName("ToastText");
            log("toastText is null")
            log(this.toastText)
        }
        this.toastText.getComponent(Label).string = text;
    }
    show(duration: number = 2): void {
        log("showing toast")
        this.setOverFlow();
        this.node.setPosition(-61, 500);
        this._duration = duration;
        this.node.active = true;
        tween(this.node)
            .to(0.3, { position: new Vec3(-61, 300, 0) })
            .delay(1)
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    private setOverFlow(): void {
        const maxWidth = 350;
        const text = this.toastText.getComponent(Label).string;
        const textWidth = this.toastText.getComponent(Label).string.length * this._textSize;
        if (textWidth > maxWidth) {
            const textCount = Math.floor(maxWidth / this._textSize)
            const truncatedText = text.slice(0, textCount - 3) + "...";
            this.toastText.getComponent(Label).string = truncatedText;
        }
    }
}

