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
    
    // Add event listeners
    addSkillBtn.addEventListener('click', addSkill);
    generateYamlBtn.addEventListener('click', generateYaml);
    copyYamlBtn.addEventListener('click', copyYaml);
    downloadYamlBtn.addEventListener('click', downloadYaml);
    
    // Add a skill
    function addSkill() {
        const skillContent = skillTemplate.content.cloneNode(true);
        const skillElement = document.createElement('div');
        skillElement.appendChild(skillContent);
        
        // Get the skill container
        const skillItem = skillElement.querySelector('.skill-item');
        
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
    
    // Add default first skill
    addSkill();
});
