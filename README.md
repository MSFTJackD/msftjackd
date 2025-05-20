# Copilot Agent YAML Generator

A simple web application that helps you create YAML files for Copilot Agents with the proper structure and formatting.

## Features

- Create Copilot Agent configurations with a user-friendly interface
- Add multiple Skills to your agent
- Pre-populated fields for common settings and interfaces
- Automatically formatted YAML output
- Copy generated YAML to clipboard
- Download YAML file directly

## Usage

1. Open `index.html` in any modern web browser
2. Fill in the Descriptor section with your agent's basic information
3. Configure the Skill Group settings
4. Add and configure Skills as needed
   - Each Skill has fields for Name, Display Name, Description, etc.
   - Add Child Skills by typing them in and clicking "Add"
5. Click "Generate YAML" to create the YAML configuration
6. Use "Copy YAML" or "Download YAML" to save your configuration

## Structure

- `index.html` - The main HTML file with the form interface
- `styles.css` - CSS styles for the application
- `script.js` - JavaScript code handling the form logic and YAML generation
- `js-yaml.min.js` - The js-yaml library for converting JavaScript objects to YAML

## Example Generated YAML

The generated YAML will follow this structure:

```yaml
Descriptor:
  Name: MyAgent
  Description: >-
    A description of my agent
  DisplayName: My Copilot Agent
SkillGroups:
  - Format: AGENT
    Settings:
      HistoryPassDownMode: None
      IncludeSessionHistory: false
    Skills:
      - Name: ExampleSkill
        DisplayName: ExampleSkill
        Description: An example skill
        Interfaces:
          - Agent
        Inputs:
          - Required: true
            Name: Input
            Description: Example skill input
        Settings:
          Instructions: >-
            Instructions for the skill
        ChildSkills:
          - ExampleChildSkill1
          - ExampleChildSkill2
```
