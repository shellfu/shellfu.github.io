export class ShaderManager {
    constructor(scene) {
        this.scene = scene;
        material = new THREE.RawShaderMaterial({
            vertexShader: vertexShaderCode,
            fragmentShader: fragmentShaderCode,
            glslVersion: THREE.GLSL3,
            uniforms: {
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uTime: { value: 0.0 },
            },
        });
        this.isVertexShader = true;
        this.customUniforms = {};
    }

    getCurrentShaderCode(isVertexShader) {
        return isVertexShader ? vertexShaderCode : fragmentShaderCode;
    }

    addCustomUniform(name, type, value) {
        this.customUniforms[name] = { type, value: this.parseValue(type, value) };
        this.compileShader(this.getCurrentShaderCode(this.isVertexShader));
    }

    removeCustomUniform(name) {
        if (this.customUniforms.hasOwnProperty(name)) {
            delete this.customUniforms[name];
            this.compileShader(this.getCurrentShaderCode(this.isVertexShader));
        }
    }

    parseValue(type, value) {
        if (type === 'float') return parseFloat(value);
        if (type.startsWith('vec')) return this.parseVector(value, parseInt(type.charAt(3), 10));
        console.error(`Invalid type: ${type}`);
        return value;
    }

    parseVector(valueString, dimensions) {
        const values = valueString.split(',').map(Number);
        if (values.length !== dimensions || values.some(isNaN)) {
            console.error(`Invalid vector: ${valueString}`);
            return null;
        }
        return values;
    }

    compileShader(shaderCode) {
        const newMaterial = new THREE.RawShaderMaterial({
            vertexShader: this.isVertexShader ? shaderCode : material.vertexShader,
            fragmentShader: !this.isVertexShader ? shaderCode : material.fragmentShader,
            uniforms: {
                ...material.uniforms,
                ...Object.fromEntries(Object.entries(this.customUniforms).map(([k, v]) => [k, {value: v.value}])),
            },
            glslVersion: THREE.GLSL3,
        });

        material.dispose();
        material = newMaterial;

        this.updateSceneMaterials();

        document.getElementById('shaderErrorContent').innerHTML = '🎉 no compile errors! 🎉';
        const toggleButton = document.getElementById('toggleShaderError');
        if (toggleButton) {
            toggleButton.classList.remove('error', 'blink');
            toggleButton.textContent = 'no compile errors! 🎉';
        }
    }

    updateSceneMaterials() {
        this.scene.traverse((object) => {
            if (object.isMesh) {
                object.material = material;
                object.material.needsUpdate = true;
            }
        });
    }

    prepareShaderCode(shaderCode, isVertexShader) {
        let uniformDeclarations = Object.keys(this.customUniforms)
            .filter((uniformName) => {
                const uniformDecl = `uniform ${this.customUniforms[uniformName].type} ${uniformName};`;
                return !shaderCode.includes(uniformDecl);
            })
            .map((uniformName) => `uniform ${this.customUniforms[uniformName].type} ${uniformName};\n`)
            .join('');

        if (uniformDeclarations) {
            if (isVertexShader) {
                shaderCode = uniformDeclarations + shaderCode;
            } else {
                const precisionIndex = shaderCode.indexOf('precision');
                const afterPrecision = precisionIndex >= 0 ? shaderCode.indexOf(';', precisionIndex) + 1 : 0;
                shaderCode = shaderCode.slice(0, afterPrecision) + '\n' + uniformDeclarations + shaderCode.slice(afterPrecision);
            }
        }

        return shaderCode;
    }

}
