import {
    _decorator,
    BoxCollider2D,
    Component,
    PolygonCollider2D,
    RigidBody2D,
    Size,
    TiledObjectGroup,
    UITransform,
    Vec2,
} from "cc"
import { ColliderManager } from "../Physics/ColliderManager"
import { fuzzyEqual } from "../Physics/PhysicsFixer"
const { ccclass, requireComponent } = _decorator

const TYPE_RECTANGLE = 0
const TYPE_POLYGON = 2

type TileObject = ReturnType<TiledObjectGroup["getObjects"]>[0]

@ccclass("GroundTile")
@requireComponent([TiledObjectGroup, ColliderManager])
export class GroundTile extends Component {
    protected onLoad(): void {
        // Cocos resets anchor and position everytime Tiled file reloaded
        this.node.getComponent(UITransform).setAnchorPoint(0, 0)
        this.node.setPosition(0, 0)

        for (const object of this.getComponent(TiledObjectGroup).getObjects()) {
            if (object.type === TYPE_RECTANGLE) {
                this.createRectangleCollider(object)
            } else if (object.type === TYPE_POLYGON) {
                this.createPolygonCollider(object)
            }
        }
    }

    private createRectangleCollider(object: TileObject): void {
        const collider = this.node.addComponent(BoxCollider2D)
        collider.size = new Size(object.width, object.height)
        collider.offset = new Vec2(
            object.x + object.width / 2,
            object.y - collider.size.y / 2, // Tiled uses top-left as origin
        )
    }

    private createPolygonCollider(object: TileObject): void {
        const collider = this.node.addComponent(PolygonCollider2D)
        const points = object.points.map(
            (point: { x: number; y: number }) => new Vec2(point.x, point.y),
        )
        collider.points = points
        collider.offset = new Vec2(object.x, object.y)
    }
}
