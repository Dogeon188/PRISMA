import {
    _decorator,
    BoxCollider2D,
    Component,
    instantiate,
    Prefab,
    Size,
    TiledObjectGroup,
    UITransform,
    Vec2,
    Vec3,
} from "cc"
import { Brick } from "../Entities/Brick"
import { ColorStringToGroupMap } from "../Physics/ColliderManager"
const { ccclass, property, requireComponent } = _decorator

type BrickObject = ReturnType<TiledObjectGroup["getObject"]> & {
    color: "red" | "green" | "blue"
}

@ccclass("BrickTile")
@requireComponent([TiledObjectGroup])
export class BrickTile extends Component {
    @property(Prefab)
    private brickPrefab: Prefab = null

    protected onLoad(): void {
        // Cocos resets anchor and position everytime Tiled file reloaded
        this.node.getComponent(UITransform).setAnchorPoint(0, 0)
        this.node.setPosition(0, 0)

        for (const object of this.getComponent(TiledObjectGroup).getObjects()) {
            this.createBrick(object as BrickObject)
        }
    }

    private createBrick(object: BrickObject): void {
        const brickNode = instantiate(this.brickPrefab)
        brickNode.name = object.name
        brickNode
            .getComponent(Brick)
            .initialize(
                ColorStringToGroupMap[object.color],
                new Vec2(object.x, object.y),
                new Size(object.width, object.height),
            )
        this.node.addChild(brickNode)
    }
}
