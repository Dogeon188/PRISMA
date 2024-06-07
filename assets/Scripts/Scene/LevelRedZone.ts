import { _decorator, Component, Vec2, Vec3 } from "cc"
import { Portal, PortalType } from "../Game/Entities/Portal"
import { GameManager } from "../Game/GameManager"
const { ccclass } = _decorator

@ccclass("LevelRedZone")
export class LevelRedZone extends Component {
    protected start(): void {
        GameManager.inst.objectsNode.children.forEach((child) => {
            const portal = child.getComponent(Portal)
            if (portal && portal.portalType === PortalType.NODE) {
                portal.node.on("teleport", (to: Vec3) => {
                    GameManager.inst.player.setSpawnPoint(new Vec2(to.x, to.y))
                })
            }
        })
    }
}
