import {
    _decorator,
    Canvas,
    CCFloat,
    clamp,
    Component,
    director,
    Label,
    Node,
    screen,
    Size,
    tween,
    Vec2,
    Vec3,
    View,
} from "cc"
const { ccclass, property } = _decorator

@ccclass("TrackCamera")
export class TrackCamera extends Component {
    @property(Label)
    debugLabel: Label = null

    @property({ type: Node })
    focused: Node = null

    _min: Vec2
    _max: Vec2

    @property({
        type: Vec2,
        group: "Boundary",
        tooltip: "The minimum coordinate (before scaling) the camera can reach",
    })
    min: Vec2 = new Vec2(0, 0)

    @property({
        type: Vec2,
        group: "Boundary",
        tooltip: "The maximum coordinate (before scaling) the camera can reach",
    })
    max: Vec2 = new Vec2(0, 0)

    @property({
        type: Vec2,
        group: "Boundary",
        tooltip: "The padding of the center of camera from the boundary",
    })
    padding: Vec2 = new Vec2(0, 0)

    @property({ type: Vec2, group: "Offset" })
    offset: Vec2 = new Vec2(0, 0)

    // @property({ type: Size})
    private cameraSize: Size = new Size(0, 0)
    private target: Vec3 = new Vec3(0, 0, 0)

    onLoad() {
        // this.cameraSize = View.instance.getVisibleSizeInPixel()
        this.cameraSize = screen.resolution.lerp(
            Size.ZERO,
            1 / screen.devicePixelRatio,
        )
        this._min = this.min.clone()
        this._max = new Vec2(
            this.max.x - this.cameraSize.width,
            this.max.y - this.cameraSize.height,
        )
    }

    focus(node: Node) {
        this.focused = node
    }

    update(deltaTime: number) {
        if (!this.focused) return

        this.focused.getWorldPosition(this.target)

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
