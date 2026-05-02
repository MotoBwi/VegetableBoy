```markdown
# VegetableBoy Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the VegetableBoy JavaScript codebase. You'll learn how to structure files, import and export modules, write and locate tests, and follow the project's commit and workflow practices. This guide is ideal for contributors looking to maintain consistency and quality in VegetableBoy.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `gameEngine.js`, `spriteLoader.js`

### Import Style
- Use **relative imports** for all modules.
  - Example:
    ```javascript
    import Sprite from './sprite';
    import { loadLevel } from '../utils/levelLoader';
    ```

### Export Style
- Use **default exports** for modules.
  - Example:
    ```javascript
    // In player.js
    class Player { /* ... */ }
    export default Player;
    ```

### Commit Patterns
- Commit messages are **freeform** (no strict prefixes), but should be clear and concise.
- Average commit message length: ~72 characters.
  - Example:  
    ```
    Fix bug in collision detection when player jumps
    ```

## Workflows

### Adding a New Module
**Trigger:** When you need to add a new feature or utility.
**Command:** `/add-module`

1. Create a new file using camelCase, e.g., `powerUpManager.js`.
2. Implement your module logic.
3. Use `export default` to export the main class or function.
4. Import your module where needed using a relative path.
5. Write a corresponding test file named `powerUpManager.test.js`.

### Writing and Running Tests
**Trigger:** When you add or update code that needs testing.
**Command:** `/run-tests`

1. Create a test file with the pattern `*.test.js` (e.g., `gameEngine.test.js`).
2. Write your test cases in this file.
3. Use the project's preferred (currently unknown) test framework.
4. Run the test suite using the appropriate command for the framework.

### Making Commits
**Trigger:** When you are ready to save your changes.
**Command:** `/commit`

1. Write a clear, concise commit message describing your change.
2. No strict prefix is required, but clarity is important.
3. Keep the message around 72 characters if possible.

## Testing Patterns

- Test files are named using the pattern `*.test.js`.
  - Example: `spriteLoader.test.js`
- The specific test framework is not detected; follow existing patterns or ask the maintainers if unsure.
- Place test files alongside the modules they test or in a dedicated `tests` directory if present.

## Commands
| Command        | Purpose                                      |
|----------------|----------------------------------------------|
| /add-module    | Scaffold a new module with proper conventions|
| /run-tests     | Run the test suite                           |
| /commit        | Make a commit following message guidelines    |
```
