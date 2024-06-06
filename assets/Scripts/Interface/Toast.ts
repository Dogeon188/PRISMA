import {
    Canvas,
    Component,
    Label,
    Node,
    UIOpacity,
    UITransform,
    Vec3,
    _decorator,
    log,
    tween,
} from "cc"

const { ccclass, property } = _decorator

@ccclass("Toast")
export class Toast extends Component {
    static readonly LENGTH_SHORT = 2
    static readonly LENGTH_LONG = 3.5

    private toastText: Node = null
    private background: Node = null
    private _lineHeight: number = 0
    private _textSize: number = 0
    private _duration: number = 0
    private canvas: Canvas = null
    private canvasUiTransform: UITransform = null
    private toastUiTransform: UITransform = null
    private backgroundUiTransform: UITransform = null

    protected start(): void {
        this.toastText = this.node.getChildByName("ToastText")
        this.background = this.node.getChildByName("Background")
        this.toastUiTransform = this.toastText.getComponent(UITransform)
        this.backgroundUiTransform = this.background.getComponent(UITransform)
        this._lineHeight = this.toastText.getComponent(Label).lineHeight
        this.node.active = false
    }
    /**
     * Set the background size of the toast
     * @param width
     * @param height
     * @returns
     */
    setBackgroundSize(width: number, height: number): void {
        this.backgroundUiTransform.width = width
        this.backgroundUiTransform.height = height
    }

    setTextSize(size: number): void {
        this.toastText.getComponent(Label).fontSize = size
        this._textSize = size
    }

    setLineHeight(height: number): void {
        this.toastText.getComponent(Label).lineHeight = height
    }

    setText(text: string): void {
        if (this.toastText == null) {
            this.toastText = this.node.getChildByName("ToastText")
        }
        this.toastText.getComponent(Label).string = text
    }
    /**
     * show the toast with easing effect
     * @param duration the duration of the toast
     */
    show(duration: number = 2, then?: () => void): void {
        this.setOverFlow()
        this.node.setPosition(0, 400)
        this._duration = duration
        this.node.active = true
        const uiOpacity = this.node.getComponent(UIOpacity)
        uiOpacity.opacity = 255
        tween(this.node)
            .to(0.5, { position: new Vec3(0, 300) }, { easing: "elasticOut" })
            .delay(this._duration)
            .call(() => {
                tween(uiOpacity)
                    .to(0.5, { opacity: 0 }, { easing: "sineIn" })
                    .call(() => {
                        this.node.active = false
                        if (then) then()
                    })
                    .start()
            })
            .start()
    }

    private setOverFlow(): void {
        // const maxWidth = 350
        const text = this.toastText.getComponent(Label).string
        // const textWidth =
        //     this.toastText.getComponent(Label).string.length * this._textSize
        // if (textWidth > maxWidth) {
        //     const textCount = Math.floor(maxWidth / this._textSize)
        //     const truncatedText = text.slice(0, textCount - 3) + "..."
        //     }
        this.toastText.getComponent(Label).string = text
    }
}
