// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const addSkillBtn = document.getElementById('add-skill');
    const skillsList = document.getElementById('skills-list');
    const generateYamlBtn = document.getElementById('generate-yaml');
    const copyYamlBtn = document.getElementById('copy-yaml');
    const downloadYamlBtn = document.getElementById('download-yaml');
    const yamlResult = document.getElementById('yaml-result');
    
    // Templates
    const skillTemplate = document.getElementById('skill-template');
    const childSkillTemplate = document.getElementById('childskill-template');
    
    // Example child skills for different agent types
    const exampleChildSkills = {
        'ServiceNowAgent': ['GetServiceNowIncident', 'GetServiceNowIncidentComments', 'SearchServiceNowIncidents'],
        'LifeCycleWorkFlowAgent': ['ActivateLifecycleWorkflow'],
        'IntuneAgent': ['GetIntuneDevices', 'GetEntraUserDetailsV1']
    };
    
    // Tooltip information for each field
    const tooltipData = {
        'descriptor-name': 'Internal name of the Plugin. Cannot contain: / \\ ? # @. Maximum length: 100 characters.',
        'descriptor-display-name': 'Human-readable name of the agent. Should be concise and descriptive. Maximum length: 40 characters.',
        'descriptor-description': 'Pure metadata for the whole plugin package. This helps users understand the agent\'s purpose. Maximum length: 16,000 characters.',
        'skillgroup-format': 'Defines execution type (e.g., AGENT, API, GPT, KQL). For Copilot Agents, this should be set to AGENT.',
        'history-passdown': 'Controls how conversation history is passed to child skills. Options: None, All, or LastExchange.',
        'include-history': 'Determines whether session history should be included in skill invocations.',
        'skill-name': 'Internal name of the skill. Should be descriptive and unique within the agent.',
        'skill-display-name': 'Human-readable name of the skill shown to users.',
        'skill-description': 'A single callable unit (Agent or Tool). Description of what the skill does. Be specific and descriptive. Helps the model select the right skill.',
        'skill-instructions': 'System prompt or role message. Detailed instructions that guide how the skill should behave. These instructions shape the skill\'s responses and capabilities.',
        'input-required': 'Specifies whether this input is mandatory for the skill to function.',
        'input-name': 'Name of the input parameter. For agent skills, this is typically \'Input\'.',
        'input-description': 'Arguments for invoking the skill. Description of what the input should contain. Helps guide users on what information to provide.',
        'childskill-list': 'List of other skills the agent can call. These are specific functions that this skill can call to retrieve or manipulate data.',
        'skill-interfaces': 'Declares capability of the skill (e.g., Agent, Action). For agent skills, this is typically \'Agent\'.'
    };
    
    // Add event listeners
    addSkillBtn.addEventListener('click', addSkill);
    generateYamlBtn.addEventListener('click', generateYaml);
    copyYamlBtn.addEventListener('click', copyYaml);
    downloadYamlBtn.addEventListener('click', downloadYaml);
    
    // Add example loaders
    document.getElementById('load-servicenow-example').addEventListener('click', function(e) {
        e.preventDefault();
        loadExample('servicenow');
    });
    document.getElementById('load-intune-example').addEventListener('click', function(e) {
        e.preventDefault();
        loadExample('intune');
    });
    document.getElementById('load-lifecycle-example').addEventListener('click', function(e) {
        e.preventDefault();
        loadExample('lifecycle');
    });
    
    // Initialize tooltips for static elements
    // initializeTooltips(); // Removed this line

    // Initialize tooltips
    function initializeTooltips() {
        // Add tooltips to static elements on the page
        Object.keys(tooltipData).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                addTooltipToElement(element, tooltipData[id]);
            }
        });
    }
    
    // Add tooltip to an element
    function addTooltipToElement(element, tooltipText) {
        // Get the parent label element
        const labelElement = element.parentElement.querySelector('label');
        
        if (labelElement) {
            // Create tooltip container
            const tooltipContainer = document.createElement('span');
            tooltipContainer.className = 'tooltip-container';
            
            // Create info icon
            const infoIcon = document.createElement('span');
            infoIcon.className = 'info-icon';
            infoIcon.textContent = 'i';
            
            // Create tooltip
            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            
            // Assemble tooltip components
            tooltipContainer.appendChild(infoIcon);
            tooltipContainer.appendChild(tooltip);
            
            // Add tooltip after the label text
            labelElement.appendChild(tooltipContainer);
        }
    }

    // Helper function to append tooltip directly to a label element
    function appendTooltipToLabel(labelElement, tooltipText) {
        if (labelElement && labelElement.tagName === 'LABEL') {
            // Prevent adding duplicate tooltips if already present
            if (labelElement.querySelector('.tooltip-container')) {
                return;
            }

            const tooltipContainer = document.createElement('span');
            tooltipContainer.className = 'tooltip-container';
            
            const infoIcon = document.createElement('span');
            infoIcon.className = 'info-icon';
            infoIcon.textContent = 'i';
            
            const tooltipSpan = document.createElement('span');
            tooltipSpan.className = 'tooltip';
            tooltipSpan.textContent = tooltipText;
            
            tooltipContainer.appendChild(infoIcon);
            tooltipContainer.appendChild(tooltipSpan);
            
            labelElement.appendChild(tooltipContainer);
        }
    }
    
    // Add tooltips to newly created skill elements
    function addSkillTooltips(skillElement) {
        // Add tooltips to basic skill fields using the standard input-based function
        addTooltipToElement(skillElement.querySelector('.skill-name'), tooltipData['skill-name']);
        addTooltipToElement(skillElement.querySelector('.skill-display-name'), tooltipData['skill-display-name']);
        addTooltipToElement(skillElement.querySelector('.skill-description'), tooltipData['skill-description']);
        addTooltipToElement(skillElement.querySelector('.skill-instructions'), tooltipData['skill-instructions']);
        
        // Tooltips for inputs section
        addTooltipToElement(skillElement.querySelector('.input-required'), tooltipData['input-required']);
        addTooltipToElement(skillElement.querySelector('.input-name'), tooltipData['input-name']);
        addTooltipToElement(skillElement.querySelector('.input-description'), tooltipData['input-description']);
        
        // For "Interfaces" label - find the label and append tooltip directly
        const interfacesContainer = skillElement.querySelector('.interfaces-container');
        if (interfacesContainer) {
            const interfacesLabel = interfacesContainer.previousElementSibling;
            appendTooltipToLabel(interfacesLabel, tooltipData['skill-interfaces']);
        }
        
        // For "Child Skills" label - find the label and append tooltip directly
        const childSkillsContainer = skillElement.querySelector('.childskills-container');
        if (childSkillsContainer) {
            const childSkillsLabel = childSkillsContainer.previousElementSibling;
            appendTooltipToLabel(childSkillsLabel, tooltipData['childskill-list']);
        }
    }
    
    // Add a skill
    function addSkill() {
        const skillContent = skillTemplate.content.cloneNode(true);
        const skillElement = document.createElement('div');
        skillElement.appendChild(skillContent);
        
        // Get the skill container
        const skillItem = skillElement.querySelector('.skill-item');
        
        // Add tooltips to the new skill
        addSkillTooltips(skillItem);
        
        // Add event listener to remove button
        const removeBtn = skillItem.querySelector('.remove-skill');
        removeBtn.addEventListener('click', function() {
            skillsList.removeChild(skillItem);
        });
        
        // Add event listener for child skill addition
        const addChildSkillBtn = skillItem.querySelector('.add-childskill');
        const newChildSkillInput = skillItem.querySelector('.new-childskill');
        const childSkillList = skillItem.querySelector('.childskill-list');
        
        addChildSkillBtn.addEventListener('click', function() {
            addChildSkill(childSkillList, newChildSkillInput.value);
            newChildSkillInput.value = ''; // Clear the input
        });
        
        // Add event listener for name change to suggest child skills
        const nameInput = skillItem.querySelector('.skill-name');
        nameInput.addEventListener('change', function() {
            const skillName = nameInput.value;
            if (exampleChildSkills[skillName]) {
                // Clear existing child skills
                childSkillList.innerHTML = '';
                
                // Add example child skills
                exampleChildSkills[skillName].forEach(childSkill => {
                    addChildSkill(childSkillList, childSkill);
                });
            }
            
            // Set display name to match name (can be changed by user later)
            const displayNameInput = skillItem.querySelector('.skill-display-name');
            if (!displayNameInput.value) {
                displayNameInput.value = skillName;
            }
        });
        
        // Append skill to the list
        skillsList.appendChild(skillItem);
    }
    
    // Add a child skill
    function addChildSkill(container, name) {
        if (!name.trim()) return;
        
        const childSkillContent = childSkillTemplate.content.cloneNode(true);
        const childSkillItem = childSkillContent.querySelector('.childskill-item');
        const childSkillName = childSkillItem.querySelector('.childskill-name');
        childSkillName.textContent = name;
        
        // Add event listener to remove button
        const removeBtn = childSkillItem.querySelector('.remove-childskill');
        removeBtn.addEventListener('click', function() {
            container.removeChild(childSkillItem);
        });
        
        container.appendChild(childSkillItem);
    }
    
    // Generate YAML
    function generateYaml() {
        try {
            // Validate required fields
            const validationErrors = validateForm();
            if (validationErrors.length > 0) {
                const errorMessage = 'Please fix the following errors:\n- ' + validationErrors.join('\n- ');
                alert(errorMessage);
                return;
            }
            
            const yamlObj = buildYamlObject();
            let yamlString = jsyaml.dump(yamlObj, { lineWidth: -1, quotingType: "'" });
            
            // Format the output with proper indentation and block strings
            yamlString = formatYamlOutput(yamlString);
            
            yamlResult.textContent = yamlString;
            
            // Enable copy and download buttons
            copyYamlBtn.disabled = false;
            downloadYamlBtn.disabled = false;
        } catch (error) {
            yamlResult.textContent = `Error generating YAML: ${error.message}`;
        }
    }
    
    // Validate the form
    function validateForm() {
        const errors = [];
        
        // Check descriptor
        const descriptorName = document.getElementById('descriptor-name').value;
        if (!descriptorName) {
            errors.push('Descriptor Name is required');
        } else if (descriptorName.length > 100) {
            errors.push('Descriptor Name must be 100 characters or less');
        }
        
        const descriptorDisplayName = document.getElementById('descriptor-display-name').value;
        if (descriptorDisplayName.length > 40) {
            errors.push('Descriptor Display Name must be 40 characters or less');
        }
        
        const descriptorDescription = document.getElementById('descriptor-description').value;
        if (!descriptorDescription) {
            errors.push('Descriptor Description is required');
        } else if (descriptorDescription.length > 16000) {
            errors.push('Descriptor Description must be 16,000 characters or less');
        }
        
        // Check skills
        const skillItems = document.querySelectorAll('.skill-item');
        if (skillItems.length === 0) {
            errors.push('At least one skill is required');
        } else {
            skillItems.forEach((skillItem, index) => {
                const skillName = skillItem.querySelector('.skill-name').value;
                if (!skillName) {
                    errors.push(`Skill #${index + 1}: Name is required`);
                }
                
                const instructions = skillItem.querySelector('.skill-instructions').value;
                if (!instructions) {
                    errors.push(`Skill #${index + 1}: Instructions are required`);
                }
            });
        }
        
        return errors;
    }
    
    // Build YAML object
    function buildYamlObject() {
        // Get Descriptor data
        const descriptorName = document.getElementById('descriptor-name').value || 'MyAgent';
        const descriptorDisplayName = document.getElementById('descriptor-display-name').value || 'My Copilot Agent';
        const descriptorDescription = document.getElementById('descriptor-description').value || 'A custom Copilot Agent';
        
        // Get SkillGroup data
        const skillGroupFormat = document.getElementById('skillgroup-format').value;
        const historyPassDownMode = document.getElementById('history-passdown').value;
        const includeSessionHistory = document.getElementById('include-history').value === 'true';
        
        // Get Skills data
        const skillItems = document.querySelectorAll('.skill-item');
        const skills = Array.from(skillItems).map(skillItem => {
            // Basic skill info
            const name = skillItem.querySelector('.skill-name').value;
            const displayName = skillItem.querySelector('.skill-display-name').value || name;
            const description = skillItem.querySelector('.skill-description').value || name;
            
            // Child skills
            const childSkillElements = skillItem.querySelectorAll('.childskill-item');
            const childSkills = Array.from(childSkillElements).map(el => 
                el.querySelector('.childskill-name').textContent
            );
            
            // Input description
            const inputDescription = skillItem.querySelector('.input-description').value || `${name} input`;
            const inputRequired = skillItem.querySelector('.input-required').value === 'true';
            
            // Instructions
            const instructions = skillItem.querySelector('.skill-instructions').value || 
                `You are an assistant for ${name}. You help users with ${description}`;
            
            // Create the skill object
            const skill = {
                Name: name,
                DisplayName: displayName,
                Description: description,
                Interfaces: ['Agent'],
                Inputs: [
                    {
                        Required: inputRequired,
                        Name: 'Input',
                        Description: inputDescription
                    }
                ],
                Settings: {
                    Instructions: instructions
                }
            };
            
            // Add child skills if there are any
            if (childSkills.length > 0) {
                skill.ChildSkills = childSkills;
            }
            
            return skill;
        });
        
        // Build the complete YAML object
        return {
            Descriptor: {
                Name: descriptorName,
                Description: descriptorDescription,
                DisplayName: descriptorDisplayName
            },
            SkillGroups: [
                {
                    Format: skillGroupFormat,
                    Settings: {
                        HistoryPassDownMode: historyPassDownMode,
                        IncludeSessionHistory: includeSessionHistory
                    },
                    Skills: skills
                }
            ]
        };
    }
    
    // Format YAML output with block strings for descriptions and instructions
    function formatYamlOutput(yamlString) {
        // Replace single quotes with block scalars for multi-line strings
        return yamlString
            .replace(/Description: '([^']*)'/g, (match, p1) => {
                if (p1.includes('\n') || p1.length > 40) {
                    return `Description: >-\n    ${p1.replace(/\n/g, '\n    ')}`;
                }
                return match;
            })
            .replace(/Instructions: '([^']*)'/g, (match, p1) => {
                if (p1.includes('\n') || p1.length > 40) {
                    return `Instructions: >-\n    ${p1.replace(/\n/g, '\n    ')}`;
                }
                return match;
            });
    }
    
    // Copy YAML to clipboard
    function copyYaml() {
        const yamlText = yamlResult.textContent;
        navigator.clipboard.writeText(yamlText).then(
            function() {
                alert('YAML copied to clipboard!');
            }, 
            function(err) {
                alert('Could not copy text: ', err);
            }
        );
    }
    
    // Download YAML file
    function downloadYaml() {
        const yamlText = yamlResult.textContent;
        const blob = new Blob([yamlText], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = 'CopilotAgent-Plugin.yaml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Load Example Configuration
    function loadExample(exampleType) {
        // Clear existing skills
        skillsList.innerHTML = '';
        
        // Set descriptor values
        if (exampleType === 'servicenow') {
            document.getElementById('descriptor-name').value = 'ServiceNowHelpdeskAgent';
            document.getElementById('descriptor-display-name').value = 'ServiceNow Helpdesk';
            document.getElementById('descriptor-description').value = 'This agent helps users lookup and manage ServiceNow tickets and incidents.';
            
            // Add ServiceNow skill
            addSkill();
            const skill = document.querySelector('.skill-item');
            skill.querySelector('.skill-name').value = 'ServiceNowAgent';
            skill.querySelector('.skill-display-name').value = 'ServiceNow Agent';
            skill.querySelector('.skill-description').value = 'Look up and manage ServiceNow tickets and incidents';
            skill.querySelector('.skill-instructions').value = 'You are a HelpDesk technician. You lookup the latest incidents in ServiceNow incident tables. You are primarily focused on the latest tickets and helping users find information about their open incidents.';
            skill.querySelector('.input-description').value = 'ServiceNow agent that can lookup existing tickets and incidents in ServiceNow.';
            
            // Add child skills
            const childSkillList = skill.querySelector('.childskill-list');
            childSkillList.innerHTML = '';
            ['GetServiceNowIncident', 'GetServiceNowIncidentComments', 'SearchServiceNowIncidents'].forEach(childSkill => {
                addChildSkill(childSkillList, childSkill);
            });
        } else if (exampleType === 'intune') {
            document.getElementById('descriptor-name').value = 'IntuneDeviceAgent';
            document.getElementById('descriptor-display-name').value = 'Intune Device Manager';
            document.getElementById('descriptor-description').value = 'This agent helps users manage and troubleshoot devices enrolled in Microsoft Intune.';
            
            // Add Intune skill
            addSkill();
            const skill = document.querySelector('.skill-item');
            skill.querySelector('.skill-name').value = 'IntuneAgent';
            skill.querySelector('.skill-display-name').value = 'Intune Agent';
            skill.querySelector('.skill-description').value = 'Manage and troubleshoot devices in Intune';
            skill.querySelector('.skill-instructions').value = 'You are an Intune administrator. You help users manage their devices enrolled in Intune, check device compliance status, and assist with troubleshooting device enrollment issues.';
            skill.querySelector('.input-description').value = 'Intune agent that can assist with managing devices from Intune.';
            
            // Add child skills
            const childSkillList = skill.querySelector('.childskill-list');
            childSkillList.innerHTML = '';
            ['GetIntuneDevices', 'GetEntraUserDetailsV1'].forEach(childSkill => {
                addChildSkill(childSkillList, childSkill);
            });
        } else if (exampleType === 'lifecycle') {
            document.getElementById('descriptor-name').value = 'LifecycleWorkflowAgent';
            document.getElementById('descriptor-display-name').value = 'Lifecycle Workflow';
            document.getElementById('descriptor-description').value = 'This agent helps users with onboarding and offboarding processes using Lifecycle Workflows.';
            
            // Add Lifecycle skill
            addSkill();
            const skill = document.querySelector('.skill-item');
            skill.querySelector('.skill-name').value = 'LifeCycleWorkFlowAgent';
            skill.querySelector('.skill-display-name').value = 'Lifecycle Workflow Agent';
            skill.querySelector('.skill-description').value = 'Assist with onboarding and offboarding processes';
            skill.querySelector('.skill-instructions').value = 'You are a HelpDesk technician. You assist in onboarding and offboarding users via Lifecycle Workflows. You help manage the employee lifecycle from hiring to departure.';
            skill.querySelector('.input-description').value = 'Lifecycle Workflow agent that can assist with employee onboarding and offboarding.';
            
            // Add child skills
            const childSkillList = skill.querySelector('.childskill-list');
            childSkillList.innerHTML = '';
            ['ActivateLifecycleWorkflow'].forEach(childSkill => {
                addChildSkill(childSkillList, childSkill);
            });
        }
    }
    
    // Add default first skill
    addSkill();
});