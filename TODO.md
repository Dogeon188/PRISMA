# Todos

## Coding Style Specification

- Please install the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension for Visual Studio Code.
  - Make sure your code is formatted with Prettier before committing.
- Write your code in ES6 style.
  - Always use `===` and `!==` for comparison.
  - `const` is preferred over `let`. Don't use `var`.
  - Always use `const` for [pure functions](https://medium.com/frochu/純粹的好-pure-function-知道-574d5c0d7819).
- Name your variables and functions with meaningful names.
  - Use `camelCase` for variable names.
  - Use `PascalCase` for class names and node names.
- `private` and `protected` are preferred than `public`.
  - Add a `_` prefix for private variables, except for cocos component properties.
- Always specify the type of the function's return value and parameters.
- Use `/** */` for documentation comments if the function will be used by other developers.
- When adding many properties to a cocos component, make use of the [grouping feature](https://docs.cocos.com/creator/manual/zh/scripting/decorator.html#group) in the editor.

## Todo List

- Control Flow
  - [ ] Start Screen
  - [ ] Save & Load Profiles (with localStorage)
  - [ ] Intro Animation
  - [ ] Pause Menu
  - [ ] Game Over
  - [ ] Credits
- Game Logics
  - [ ] Basic Game Physics
    - [ ] Gravity
    - [ ] Collision
      - [ ] Player Collision
      - [ ] Fallable Collision
  - [ ] Player Control
    - [ ] Jump & Walk
    - [ ] Interact with Objects
    - [ ] Change hyalumen color
  - [ ] "Hyalumen" Logic
    - [ ] Change Color
    - [ ] Collision disableing for same color objects
  - [ ] Interactable Objects
    - Contraptions
      - [ ] Pressure Plate
      - [ ] Door
      - [ ] Button
      - [ ] Lever
      - [ ] Pulley (軸車)
      - [ ] Plinth (燈座)
    - [ ] Entrance
    - [ ] Map Item with Lore
- UI
  - [ ] Change hyalumen color
  - [ ] Inventory Display
- Graphics & Animations
  - Game Sprites
  - [ ] Shader
- Game Design
  - [ ] Tutorial
  - Levels
    - [ ] Red
    - [ ] Green
    - [ ] Blue
- Story & Lore
  - [ ] Background Setting
  - [ ] Intro
  - [ ] Main Story
  - [ ] Finale
