import { Director, Scene, UIOpacity, _decorator, director, log, tween } from "cc"
import { BlackMaskManager } from "./Interface/BlackMaskManager"
export class SceneManager {
    /**
     * Load a scene with fade-in/out transitions
     *
     * @param sceneName The name of the scene to load
     * @param outDuration The duration of the fade-out transition of the current scene
     * @param inDuration The duration of the fade-in transition to the target scene
     * @param loadDuration The duration of the fade-in/out transition of the loading scene
     */
    static loadScene(
        sceneName: string,
        noLoading: boolean = false,
        outDuration: number = 0.5,
        inDuration: number = 0.5,
        loadDuration: number = 0.2,
    ): void {
        const nextIn: Director.OnSceneLaunched = (_, scene) => {
            BlackMaskManager.fadeOut(inDuration)
        }

        const loadOut: Director.OnSceneLoaded = (_, __) => {
            const load = () => {
                director.loadScene(sceneName, nextIn)
            }
            BlackMaskManager.fadeIn(loadDuration, load)
        }

        const loadIn: Director.OnSceneLaunched = (_, scene) => {
            const preload = () =>{
                director.preloadScene(sceneName, loadOut)
            }
            BlackMaskManager.fadeOut(loadDuration, preload)
        }

        BlackMaskManager.fadeIn(outDuration, () => {
            if (noLoading) {
                director.loadScene(sceneName, nextIn)
                return
            }
            director.loadScene("Loading", loadIn)
        })
    }
}
