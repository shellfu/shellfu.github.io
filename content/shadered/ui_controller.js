export class UIController {
    constructor(shaderEditor, shaderManager) {
        this.shaderEditor = shaderEditor;
        this.shaderManager = shaderManager;
        this.populateThemeDropdown();
        this.loadAndInitializeSnippets();
        document.getElementById('addUniform').addEventListener('click', () => this.addCustomUniform());
        document.getElementById('shaderType').addEventListener('change', (e) => this.updateShaderType(e));
        document.getElementById('editorTheme').addEventListener('change', (e) => this.updateEditorTheme(e.target.value));
        document.getElementById('vimMode').addEventListener('change', (e) => this.toggleVimMode(e));
        document.getElementById('toggleUniformsPanel').addEventListener('click', () => this.toggleUniformsPanel());
        document.getElementById('downloadShader').addEventListener('click', () => this.downloadShader());
        document.getElementById('increaseFontSize').addEventListener('click', () => this.increaseFontSize());
        document.getElementById('decreaseFontSize').addEventListener('click', () => this.decreaseFontSize());
        document.getElementById('toggleShaderError').addEventListener('click', () => this.toggleShaderErrorPanel());
    }

    toggleShaderErrorPanel() {
        const panel = document.getElementById('shaderErrorPanel');
        panel.classList.toggle('open');
    }

    displayShaderErrors(errors) {
        const errorContainer = document.getElementById('shaderErrorContent');
        errorContainer.innerHTML = '';
        errors.forEach(function(error) {
            var errorDiv = document.createElement('div');
            errorDiv.textContent = error;
            errorContainer.appendChild(errorDiv);
        });
    }

    increaseFontSize() {
        const currentSize = parseInt(this.shaderEditor.getFontSize(), 10);
        this.shaderEditor.setFontSize(currentSize + 1);
    }

    decreaseFontSize() {
        const currentSize = parseInt(this.shaderEditor.getFontSize(), 10);
        this.shaderEditor.setFontSize(Math.max(currentSize - 1, 8));
    }

    downloadShader() {
        this.shaderEditor.downloadShaderCode();
    }

    toggleVimMode(e) {
        if (e.target.checked) {
            this.shaderEditor.editor.setKeyboardHandler('ace/keyboard/vim');
        } else {
            this.shaderEditor.editor.setKeyboardHandler('');
        }
    }

    toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    populateThemeDropdown() {
        const lightThemes = [
            'chrome',
            'clouds',
            'crimson_editor',
            'dawn',
            'dreamweaver',
            'eclipse',
            'github',
            'iplastic',
            'katzenmilch',
            'kuroir',
            'solarized_light',
            'sqlserver',
            'textmate',
            'tomorrow',
            'xcode',
        ];
        const darkThemes = [
            'ambiance',
            'chaos',
            'clouds_midnight',
            'cobalt',
            'dracula',
            'gob',
            'gruvbox',
            'idle_fingers',
            'kr_theme',
            'merbivore',
            'merbivore_soft',
            'mono_industrial',
            'monokai',
            'pastel_on_dark',
            'solarized_dark',
            'terminal',
            'tomorrow_night',
            'tomorrow_night_blue',
            'tomorrow_night_bright',
            'tomorrow_night_eighties',
            'twilight',
            'vibrant_ink',
        ];
        const themeDropdown = document.getElementById('editorTheme');
        this.populateThemeGroup('Light', lightThemes, themeDropdown);
        this.populateThemeGroup('Dark', darkThemes, themeDropdown);
    }

    populateThemeGroup(label, themes, dropdown) {
        const group = dropdown.querySelector(`optgroup[label="${label}"]`);
        themes.forEach(theme => {
            let option = document.createElement('option');
            option.textContent = this.toTitleCase(theme.replace(/_/g, ' '));
            option.value = `ace/theme/${theme}`;
            if (theme === 'mono_industrial') {
                option.selected = true;
            }
            group.appendChild(option);
        });
    }

    updateEditorTheme(theme) {
        this.shaderEditor.editor.setTheme(theme);
    }

    addCustomUniform() {
        const name = document.getElementById('uniformName').value.trim();
        const type = document.getElementById('uniformType').value;
        const value = document.getElementById('uniformValue').value.trim();
        this.shaderManager.prepareShaderCode(this.shaderEditor.getValue());
        this.shaderManager.addCustomUniform(name, type, value);
        this.updateCustomUniformList();
    }

    updateShaderType(e) {
        const isVertexShader = document.getElementById('shaderType').value === 'vertex';
        this.shaderEditor.updateEditorContent(isVertexShader);
        this.shaderManager.compileShader(this.shaderEditor.getValue(), isVertexShader);
    }

    toggleUniformsPanel() {
        const uniformsPanel = document.getElementById('uniformsPanel');
        const isOpen = uniformsPanel.style.transform === 'translateY(0px)';
        uniformsPanel.style.transform = isOpen ? 'translateY(100%)' : 'translateY(0px)';
    }

    updateCustomUniformList() {
        const customUniformTable = document.getElementById('customUniforms');
        customUniformTable.innerHTML = '<tr><th>Name</th><th>Type</th><th>Value</th></tr>'; // Table headers

        Object.entries(this.shaderManager.customUniforms).forEach(([uniformName, uniform], index) => {
            const row = customUniformTable.insertRow(-1);
            row.className = index % 2 ? 'odd' : 'even';
            row.onclick = () => this.editUniform(uniformName);

            let cell = row.insertCell(0);
            cell.textContent = uniformName;

            cell = row.insertCell(1);
            cell.textContent = uniform.type;

            cell = row.insertCell(2);
            cell.textContent = this.formatUniformValue(uniform.value);

            // Remove button
            const removeCell = row.insertCell(3);
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = () => {
                this.shaderManager.removeCustomUniform(uniformName);
                this.updateCustomUniformList();
            };
            removeCell.appendChild(removeButton);
        });
    }

    editUniform(uniformName) {
        const uniform = this.shaderManager.customUniforms[uniformName];
        document.getElementById('uniformName').value = uniformName;
        document.getElementById('uniformType').value = uniform.type;
        document.getElementById('uniformValue').value = this.formatUniformValue(uniform.value, true);
    }

    formatUniformValue(value, forInput = false) {
        if (Array.isArray(value)) {
            return forInput ? value.join(', ') : `Vector(${value.join(', ')})`;
        } else {
            return value.toString();
        }
    }

    async loadAndInitializeSnippets() {
        const snippetsPaths = {
            "default vertex shader": "./snippets/default_vertex_shader.glsl",
            "default fragment shader": "./snippets/default_fragment_shader.glsl",
        };

        const snippetSelector = document.getElementById('snippets');
        if (!snippetSelector) return;

        for (const [name, path] of Object.entries(snippetsPaths)) {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
                const code = await response.text();
                const option = document.createElement('option');
                option.value = code;
                option.textContent = name;
                snippetSelector.appendChild(option);
            } catch (error) {
                console.error('Error loading snippets:', error);
            }
        }

        snippetSelector.addEventListener('change', function() {
            const snippetCode = this.value;
            if (snippetCode) {
                const editor = ace.edit('editor');
                const session = editor.getSession();
                const cursor = editor.getCursorPosition();
                session.insert(cursor, snippetCode + '\n');
                this.selectedIndex = 0;
            }
        });
    }
}
