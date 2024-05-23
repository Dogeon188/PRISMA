import {
    _decorator,
    BoxCollider2D,
    Component,
    instantiate,
    Node,
    Prefab,
    RigidBody2D,
    Size,
    TiledObjectGroup,
    UITransform,
    Vec2,
} from "cc"
const { ccclass, property, requireComponent } = _decorator

@ccclass("TiledBarrier")
@requireComponent([TiledObjectGroup, RigidBody2D])
export class TiledBarrier extends Component {
    protected onLoad(): void {
        // Cocos resets anchor and position everytime Tiled file reloaded
        this.node.getComponent(UITransform).setAnchorPoint(0, 0)
        this.node.setPosition(0, 0)

        for (const object of this.getComponent(TiledObjectGroup).getObjects()) {
            const collider = this.node.addComponent(BoxCollider2D)
            collider.size = new Size(object.width, object.height)
            collider.offset = new Vec2(
                object.x + object.width / 2,
                object.y - collider.size.y / 2, // Tiled uses top-left as origin
            )
        }
    }
}
