import {
    _decorator,
    clamp,
    Component,
    Node,
    screen,
    Size,
    Vec2,
    Vec3,
} from "cc"
const { ccclass, property } = _decorator

@ccclass("TrackCamera")
export class TrackCamera extends Component {
    private _min: Vec2
    private _max: Vec2

    @property({
        tooltip: "The minimum coordinate the camera can show",
    })
    private min: Vec2 = new Vec2(0, 0)

    @property({
        tooltip: "The maximum coordinate the camera can show",
    })
    private max: Vec2 = new Vec2(0, 0)

    @property({ type: Node, tooltip: "The node to focus on" })
    private focus: Node = null
    private cameraSize: Size = new Size(0, 0)
    private target: Vec3 = new Vec3(0, 0, 0)

    onLoad(): void {
        this.cameraSize = Size.ZERO.lerp(
            screen.resolution,
            1 / screen.devicePixelRatio,
        )
        console.log(this.cameraSize)
        this._min = this.min.clone()
        this._max = new Vec2(
            this.max.x - this.cameraSize.width,
            this.max.y - this.cameraSize.height,
        )
    }

    /**
     * Change the focus of the camera
     */
    focusOn(node: Node): void {
        this.focus = node
    }

    protected update(deltaTime: number): void {
        if (!this.focus) return

        this.focus.getWorldPosition(this.target)

        this.target.x = clamp(
            this.target.x - this.cameraSize.width / 2,
            this._min.x,
            this._max.x,
        )
        this.target.y = clamp(
            this.target.y - this.cameraSize.height / 2,
            this._min.y,
            this._max.y,
        )
        this.target.z = this.node.getPosition().z

        this.node.setPosition(this.target.lerp(this.node.getPosition(), 0.9))
    }
}
