import {
    _decorator,
    Button,
    Component,
    director,
    Node,
    Sprite,
    SpriteFrame,
} from "cc"
import { GameManager } from "./Game/GameManager"
import { Player } from "./Game/Player"
const { ccclass, property } = _decorator

@ccclass("PlayPauseButton")
export class PlayPauseButton extends Component {
    public isPlay: boolean = true

    @property(SpriteFrame)
    private playSprite: SpriteFrame = null

    @property(SpriteFrame)
    private pauseSprite: SpriteFrame = null

    @property(Node)
    private player: Node = null

    protected onLoad(): void {
        this.node.getParent().getChildByName("Blank").active = false
        this.node.getParent().getChildByName("PausePage").active = false
    }

    private pauseGame(): void {
        director.pause()
    }

    private resumeGame(): void {
        director.resume()
    }

    protected pausePlayButton(): void {
        if (this.isPlay) {
            this.pauseGame()
            this.isPlay = false
            this.getComponent(Sprite).spriteFrame = this.playSprite
            this.node.getParent().getChildByName("Blank").active = true
            this.node.getParent().getChildByName("PausePage").active = true
            // disable button
            this.node.getComponent(Button).interactable = false
        } else {
            this.resumeGame()
            this.isPlay = true
            this.getComponent(Sprite).spriteFrame = this.pauseSprite
            this.node.getParent().getChildByName("Blank").active = false
            this.node.getParent().getChildByName("PausePage").active = false
            // enable button
            this.node.getComponent(Button).interactable = true
        }
    }

    protected leaveGame(): void {
        this.pausePlayButton()
        GameManager.inst.backToStart()
    }
}
