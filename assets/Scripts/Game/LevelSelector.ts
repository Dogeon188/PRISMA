/**
 * LevelSelector.ts
 *
 * Cheat commands for selecting levels and teleporting the player.
 *
 * Usage (in the browser console):
 *
 *    level(Levels.Test)    // Load the Test level
 *    teleport(0, 0)        // Teleport the player to the origin
 */

import { director } from "cc"
import { EDITOR_NOT_IN_PREVIEW } from "cc/env"
import { SceneManager } from "../SceneManager"
import { GameManager } from "./GameManager"

export class LevelSelector {
    private static readonly LEVELS = {
        Test: "Test",
        Lobby: "Lobby",
        Red: "RedZone",
        Green1: "GreenZoneM1",
        Green2: "GreenZoneM2",
        Green3: "GreenZoneM3",
        Green4: "GreenZoneM4",
        Blue1: "BlueZoneM1",
        Blue2: "BlueZoneM2",
        Blue3: "BlueZoneM3",
    }

    gotoLevel(level: string) {
        if (!Object.values(LevelSelector.LEVELS).includes(level)) {
            console.warn(`Level ${level} not found`)
            return
        }
        SceneManager.loadScene(`Level${level}`)
    }

    gotoPosition(x: number, y: number) {
        const gameManager = director
            .getScene()
            ?.getChildByName("GameManager")
            ?.getComponent(GameManager)
        if (!gameManager) {
            console.warn("GameManager not found")
            return
        }
        gameManager.player.node.setPosition(x, y)
    }

    static initialize() {
        globalThis.Levels = LevelSelector.LEVELS
        globalThis.level = LevelSelector.prototype.gotoLevel
        globalThis.teleport = LevelSelector.prototype.gotoPosition
    }
}

let initialized = false
if (!EDITOR_NOT_IN_PREVIEW && !initialized) {
    LevelSelector.initialize()
    initialized = true
}
