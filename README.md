# coach-custom-assistant-example-errors-rstudio
R Studio error explanation assistant that provides clear, non-technical explanations for programming errors.

## Features:

### Error Analysis:
- Explains R programming errors in plain, non-technical English
- Focuses on cause identification without suggesting solutions
- Includes context about common misconceptions
- Uses markdown syntax for code references

### Context Processing:
- Processes .rmd file extensions
- Incorporates assignment instructions
- Collects student's current code state
- Validates input to ensure it's an actual error message

### Response Format:
- Direct student addressing
- 2-3 sentence explanations
- Clear cause identification
- No solution suggestions
- Proper code formatting with markdown syntax

### Input Validation:
- Checks for error message indicators
- Validates technical terminology
- Identifies stack traces and line numbers
- Recognizes automated grading feedback
