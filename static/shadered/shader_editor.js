export class ShaderEditor {
    constructor(editorId, shaderManager) {
        this.editor = ace.edit(editorId);
        this.shaderManager = shaderManager;
        this.setupEditor();
        this.bindEditorEvents();
        // Initialize shader code properties
        this.vertexShaderCode = window.vertexShaderCode; // Initial vertex shader code
        this.fragmentShaderCode = window.fragmentShaderCode; // Initial fragment shader code
        this.currentShaderType = 'fragment'; // Default to fragment shader
    }

    setupEditor() {
        this.editor.setTheme('ace/theme/mono_industrial');
        this.editor.session.setMode('ace/mode/glsl');
        this.editor.setFontSize(14);
        const langTools = ace.require('ace/ext/language_tools');
        this.editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
        });
        this.editor.completers = [
            langTools.snippetCompleter,
            langTools.keyWordCompleter,
            langTools.textCompleter,
        ];
    }

    getFontSize() {
        return this.editor.getFontSize();
    }

    setFontSize(size) {
        this.editor.setFontSize(size);
    }

    getValue() {
        return this.editor.getValue();
    }

    setValue(value) {
        if (this.currentShaderType === 'vertex') {
            this.vertexShaderCode = value;
        } else {
            this.fragmentShaderCode = value;
        }
        this.editor.setValue(value, -1);
    }

    downloadShaderCode() {
        const shaderCode = this.getValue(); // Method to get the current shader code from the editor
        const shaderType = this.currentShaderType; // 'vertex' or 'fragment'
        const filename = shaderType === 'vertex' ? 'vertex_shader.glsl' : 'fragment_shader.glsl';

        const blob = new Blob([shaderCode], { type: 'text/plain' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = filename; // Use the dynamic filename based on shader type
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }

    updateEditorContent(isVertexShader) {
        this.currentShaderType = isVertexShader ? 'vertex' : 'fragment';
        const shaderCode = isVertexShader ? this.vertexShaderCode : this.fragmentShaderCode;
        this.editor.setValue(shaderCode, -1);
    }

    bindEditorEvents() {
        this.editor.session.on('change', () => {
            const shaderType = document.getElementById('shaderType').value;
            this.currentShaderType = shaderType; // Update the current shader type
            const shaderCode = this.getValue();
            // Save the current shader code based on the shader type
            if (shaderType === 'vertex') {
                this.vertexShaderCode = shaderCode;
            } else {
                this.fragmentShaderCode = shaderCode;
            }
            this.shaderManager.isVertexShader = (shaderType === 'vertex');
            this.shaderManager.compileShader(shaderCode); // Compile the current shader code
        });

        // Handle shader type changes
        document.getElementById('shaderType').addEventListener('change', (e) => {
            const isVertexShader = e.target.value === 'vertex';
            this.updateEditorContent(isVertexShader); // Update the editor with the corresponding shader code
            // Trigger shader compilation for the newly selected shader type
            const shaderCode = isVertexShader ? this.vertexShaderCode : this.fragmentShaderCode;
            this.shaderManager.compileShader(shaderCode);
        });
    }

    onSuccessfulShaderCompilation() {
        clearEditorAnnotations(editor);
        document.getElementById('shaderError').innerHTML = '';
    }

}
