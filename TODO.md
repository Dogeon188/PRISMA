# Todos

## Coding Style Specification

- Please install the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension for Visual Studio Code.
  - Make sure your code is formatted with Prettier before committing.
- Write your code in ES6 style.
  - Always use `===` and `!==` for comparison.
  - `const` is preferred over `let`. Don't use `var`.
  - Always use `const` for [pure functions](https://medium.com/frochu/純粹的好-pure-function-知道-574d5c0d7819).
- Name your variables and functions with meaningful names.
  - Use `snake_case` for assets and file names.
  - Use `camelCase` for variable names.
  - Use `PascalCase` for class names, node names, and folder names.
  - Full, descriptive names are preferred over short, cryptic names.
- `private` and `protected` are preferred than `public`.
  - Add a `_` prefix for private variables with public getter/setter.
- Always specify the type of the function's return value and parameters.
- Use [JSDoc](https://jsdoc.app) for documentation comments if the function will be used by other developers.
- When adding many properties to a cocos component, make use of the [grouping feature](https://docs.cocos.com/creator/manual/zh/scripting/decorator.html#group) in the editor.

## Todo List

Please check the [Notion Page](https://www.notion.so/dogeon/afa64d7568b145d3b62833bb85adad6b?v=d4a43bd7531e4c90a0af5e8af774975d&pvs=4) for the latest todo list.
