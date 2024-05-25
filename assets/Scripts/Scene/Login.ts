import { _decorator, Component, Node, director, EditBox } from "cc"

const { ccclass, property } = _decorator

declare const firebase: any

@ccclass("Login")
export class Login extends Component {
    @property({ type: EditBox })
    private email: EditBox = null

    @property({ type: EditBox })
    private password: EditBox = null

    protected navigateToRegister(): void {
        director.loadScene("Register")
    }

    protected login(): void {
        const email = this.email.string
        const password = this.password.string
        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then((user) => {
                alert("User signed in successfully")
                console.log(firebase.auth().currentUser.displayName)
            })
            .catch((error) => {
                alert(error.message)
            })
    }
}
