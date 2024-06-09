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
    public damping: number = 0.9
    public shake: number = 0

    protected onLoad(): void {
        this.cameraSize = screen.resolution.lerp(
            Size.ZERO,
            1 - 1 / screen.devicePixelRatio,
        )
        this._min = this.min.clone()
        this._max = new Vec2(
            this.max.x - this.cameraSize.width,
            this.max.y - this.cameraSize.height,
        )
    }

    /**
     * Change the focus of the camera
     */
    focusOn(node: Node, force: boolean = true): void {
        this.focus = node
        if (force)
            this.scheduleOnce(() => {
                this.node.setPosition(this.getTargetPosition())
            }, 0)
    }

    protected update(deltaTime: number): void {
        if (!this.focus) return

        this.getTargetPosition()

        this.node.setPosition(this.target.lerp(this.node.getPosition(), this.damping))
        // console.clear()
        // console.log(this.node.getPosition())

        if (this.shake > 0) {
            this.node.setPosition(
                this.node.getPosition().add(
                    new Vec3(
                        (Math.random() - 0.5) * this.shake,
                        (Math.random() - 0.5) * this.shake,
                        0,
                    ),
                ),
            )
        }
    }

    private getTargetPosition(): Vec3 {
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

        return this.target
    }
}
