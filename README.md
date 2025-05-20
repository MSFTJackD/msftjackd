# Copilot Agent YAML Generator

A lightweight, client-side tool to help you create YAML configuration files for Microsoft Copilot custom plugins and agents.

## Features

- **Interactive YAML Generation**: Easily create Copilot Agent YAML files through a user-friendly form interface
- **Auto-suggest Child Skills**: Built-in suggestions for common agent types (ServiceNow, Lifecycle, Intune)
- **Real-time Validation**: Validate your configuration before generating the final YAML
- **Detailed Tooltips**: Hover over fields to see explanations and requirements based on Microsoft's documentation
- **Schema Reference**: Access detailed schema information for each part of the YAML structure
- **Best Practices**: Get guidance on creating effective agent configurations
- **No Server Required**: Pure HTML, CSS, and JavaScript that runs directly in the browser

## Access the Tool

You can use this tool in two ways:

1. **Online Version**: Access directly through GitHub Pages without downloading anything:
   - [https://YOUR-USERNAME.github.io/AgentWorkshop](https://YOUR-USERNAME.github.io/AgentWorkshop)
   - Replace `YOUR-USERNAME` with your GitHub username

2. **Local Version**: Clone and use locally:
   - Clone this repository
   - Open `index.html` in your browser

## Getting Started

1. Open the `index.html` file directly in your web browser
2. Fill in the required fields for your agent in the Descriptor section
3. Add skills using the "Add Skill" button
   - Try entering "ServiceNowAgent", "LifeCycleWorkFlowAgent", or "IntuneAgent" for auto-suggested child skills
4. Add child skills using the input box in each skill section
5. Click "Generate YAML" to create your configuration
6. Copy or download the YAML for use with Microsoft Copilot

## Documentation

For detailed information about Microsoft Copilot custom plugins, visit the [official documentation](https://learn.microsoft.com/en-us/copilot/security/custom-plugins).

## Resources

- [Microsoft Copilot Custom Plugins Documentation](https://learn.microsoft.com/en-us/copilot/security/custom-plugins)
- [Plugin Error Codes](https://learn.microsoft.com/en-us/copilot/security/plugin-error-codes)
- [Security Copilot GitHub](https://github.com/Azure/Copilot-For-Security)
