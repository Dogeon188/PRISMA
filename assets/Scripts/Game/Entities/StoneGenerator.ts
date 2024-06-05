import { _decorator, Component, instantiate, Node, Prefab } from "cc"
const { ccclass, property } = _decorator

@ccclass("StoneGenerator")
export class StoneGenerator extends Component {
    // will create a stone every 3 seconds
    private timeToCreateStone = 3
    private timePassed = 0

    @property({ type: Prefab })
    stone: Prefab = null

    start() {
        this.timePassed = 0
    }

    update(deltaTime: number) {
        this.timePassed += deltaTime

        if (this.timePassed >= this.timeToCreateStone) {
            this.timePassed = 0
            this.createStone()
        }
    }

    createStone() {
        // create a stone using the prefab called stone
        const stone = instantiate(this.stone)
        this.node.addChild(stone)
        stone.setPosition(0, 0, 0)
    }
}
