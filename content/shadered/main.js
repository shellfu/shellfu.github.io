// ES6 Module Imports
import { SceneSetup } from './scene.js';
import { ShaderManager } from './shader_manager.js';
import { ShaderEditor } from './shader_editor.js';
import { UIController } from './ui_controller.js';

document.addEventListener('DOMContentLoaded', () => {
      // Display the modal on page load
      const modal = document.getElementById('helpModal');
      modal.style.display = 'block';

      // When the user clicks on <span> (x), close the modal
      document.querySelector('.close-button').onclick = function() {
        modal.style.display = 'none';
      }

      // Also close the modal if the user clicks anywhere outside of the modal content
      window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = 'none';
        }
      }

    const originalConsoleError = console.error;
    console.error = function (message, ...optionalParams) {
        if (message.includes('THREE.WebGLProgram: Shader Error')) {
            let formattedMessage = `<strong>Error:</strong> ${message}<br>`;
            optionalParams.forEach(param => {
                formattedMessage += `<code>${param}</code><br>`;
            });
            document.getElementById('shaderErrorContent').innerHTML = formattedMessage;

            const toggleButton = document.getElementById('toggleShaderError');
            if (toggleButton) {
                toggleButton.classList.add('error', 'blink');
                toggleButton.textContent = 'view compile errors!';
            }
        } else {
            // For all other types of errors, call the original console.error
            originalConsoleError.apply(console, [message, ...optionalParams]);
        }
    };

    // Setup application
    async function setupApplication() {
        try {
            // Fetch shader codes
            const vshResponse = await fetch('./snippets/default_vertex_shader.glsl');
            const fshResponse = await fetch('./snippets/default_fragment_shader.glsl');
            if (!vshResponse.ok || !fshResponse.ok) {
                throw new Error('Shader file fetch failed');
            }

            window.vertexShaderCode = await vshResponse.text();
            window.fragmentShaderCode = await fshResponse.text();

            const sceneSetup = new SceneSetup();
            const shaderManager = new ShaderManager(sceneSetup.scene, window.material);
            const editor = new ShaderEditor('editor', shaderManager);
            const uiController = new UIController(editor, shaderManager);

            // Initial shader code setup in editor
            editor.setValue(window.fragmentShaderCode); // Set initial value
            sceneSetup.animate();
        } catch (error) {
            console.error('An error occurred during application setup:', error);
        }
    }

    setupApplication().catch(error => {
        console.error('An error occurred:', error);
    });

});
