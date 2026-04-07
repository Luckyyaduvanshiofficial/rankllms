```markdown
# rankllms Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and workflows used in the `rankllms` repository. The project is primarily written in TypeScript, with a focus on frontend (React, Astro) and backend (Python API) development. It covers how to structure code, manage dependencies, run and report tests, and follow established workflows for feature development and maintenance.

## Coding Conventions

- **File Naming:**  
  Use camelCase for file names.  
  _Example:_  
  ```
  userProfile.tsx
  apiHandler.ts
  ```

- **Import Style:**  
  Use relative imports for modules.  
  _Example:_  
  ```typescript
  import userService from '../services/userService'
  import Button from './Button'
  ```

- **Export Style:**  
  Use default exports for modules.  
  _Example:_  
  ```typescript
  const UserProfile = () => { /* ... */ }
  export default UserProfile
  ```

- **Commit Messages:**  
  Freeform style, average length ~52 characters.  
  _Example:_  
  ```
  Add new ranking algorithm for LLM comparison
  ```

## Workflows

### Frontend Feature Development
**Trigger:** When you want to add or modify a frontend feature or page.  
**Command:** `/frontend-feature`

1. Edit or create React components in `frontend/src/components/`
2. Edit or create Astro pages/layouts in `frontend/src/pages/` and `frontend/src/layouts/`
3. Update global styles in `frontend/src/styles/global.css`
4. Update configuration in:
    - `frontend/astro.config.mjs`
    - `frontend/package.json`
    - `frontend/tsconfig.json`
5. If dependencies change, update lock files (`frontend/yarn.lock`)

_Example: Adding a new React component_
```typescript
// frontend/src/components/scoreCard.tsx
const ScoreCard = ({ score }) => (
  <div className="score-card">{score}</div>
)
export default ScoreCard
```
_Example: Importing the new component_
```typescript
import ScoreCard from '../components/scoreCard'
```

---

### Backend API Update and Test
**Trigger:** When you want to add or modify backend API functionality.  
**Command:** `/backend-api-update`

1. Edit `backend/server.py` to implement or update API logic
2. If dependencies change, update `backend/requirements.txt`
3. Edit or add tests in `backend/tests/test_api.py`
4. Test artifacts may update in `backend/tests/__pycache__/` and `backend/__pycache__/`

_Example: Adding a new API endpoint in Python_
```python
# backend/server.py
@app.route('/api/rank', methods=['POST'])
def rank_llms():
    # Implementation here
    return jsonify({"result": "success"})
```

---

### Test Report Generation
**Trigger:** When you run tests and want to save or update test result reports.  
**Command:** `/generate-test-report`

1. Run tests (e.g., with `pytest`)
2. Generate or update JSON reports: `test_reports/iteration_*.json`
3. Generate or update XML reports: `test_reports/pytest/pytest_results.xml`

_Example: Running tests and generating a report_
```bash
pytest --junitxml=test_reports/pytest/pytest_results.xml
```

## Testing Patterns

- **Test Files:**  
  Test files follow the pattern `*.test.*` (e.g., `userService.test.ts`)
- **Framework:**  
  The specific testing framework is unknown, but tests are present for both frontend and backend.
- **Test Reports:**  
  Test results are saved as JSON and XML in the `test_reports/` directory.

_Example: Test file naming_
```
frontend/src/components/button.test.tsx
backend/tests/test_api.py
```

## Commands

| Command                | Purpose                                           |
|------------------------|---------------------------------------------------|
| /frontend-feature      | Start or update a frontend feature or page        |
| /backend-api-update    | Update backend API logic and tests                |
| /generate-test-report  | Generate or update test result reports            |
```