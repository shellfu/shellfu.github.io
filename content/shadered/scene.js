export class SceneSetup {
    constructor() {
        // Initialization remains largely the same, just remove orthographic camera setup
        this.renderCanvas = document.getElementById('rendered-view');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0x000000);
        this.renderer.setSize(this.renderCanvas.clientWidth, this.renderCanvas.clientHeight);
        this.renderCanvas.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(75, this.renderCanvas.clientWidth / this.renderCanvas.clientHeight, 0.1, 1000);
        this.camera.position.z = 1.8; // Starting position for the camera

        this.initialCameraSettings = {
            fov: this.camera.fov,
            aspect: this.camera.aspect,
            near: this.camera.near,
            far: this.camera.far,
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
        };

        this.scene = new THREE.Scene();
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        // Material setup remains the same
        window.material = new THREE.RawShaderMaterial({
            uniforms: {
                uResolution: { value: new THREE.Vector2(this.renderCanvas.clientWidth, this.renderCanvas.clientHeight) },
                uCameraPosition: { value: this.camera.position.clone() },
                uTime: { value: 0.0 },
            },
            vertexShader: vertexShaderCode,
            fragmentShader: fragmentShaderCode,
            glslVersion: THREE.GLSL3,
        });

        // Sphere setup remains the same
        this.setupInitialGeometry();

        this.stats = new Stats();
        const renderedView = document.getElementById('rendered-view');
        renderedView.style.position = 'relative';
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.background = 'rgba(0,0,0,0)';
        this.stats.domElement.style.zIndex = '100';
        renderedView.appendChild(this.stats.domElement);

        // Event listeners setup remains the same
        this.animate();
        document.getElementById('shapeType').addEventListener('change', (event) => this.switchGeometry(event.target.value));
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupInitialGeometry() {
        this.sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
        this.sphere = new THREE.Mesh(this.sphereGeometry, window.material);
        this.currentGeometry = this.sphere;
        this.scene.add(this.sphere);
        document.getElementById('shapeType').value = 'sphere';
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        window.material.uniforms.uTime.value += 0.05;

        if (window.material && window.material.uniforms && window.material.uniforms.uCameraPosition) {
            window.material.uniforms.uTime.value += 0.05;
            window.material.uniforms.uCameraPosition.value.copy(this.camera.position);
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        this.stats.update();
    }

    onWindowResize() {
        const width = this.renderCanvas.clientWidth;
        const height = this.renderCanvas.clientHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        window.material.uniforms.uResolution.value.set(width, height);
    }

    switchGeometry(geometryType) {
        if (this.currentGeometry) this.scene.remove(this.currentGeometry);

        this.onWindowResize();
        // reset the camera
        this.camera.fov = this.initialCameraSettings.fov;
        this.camera.aspect = this.initialCameraSettings.aspect;
        this.camera.near = this.initialCameraSettings.near;
        this.camera.far = this.initialCameraSettings.far;
        this.camera.position.copy(this.initialCameraSettings.position);
        this.camera.rotation.copy(this.initialCameraSettings.rotation);
        this.camera.updateProjectionMatrix();

        if (geometryType === 'cube') {
            const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
            this.currentGeometry = new THREE.Mesh(cubeGeometry, window.material);
        } else if (geometryType === 'sphere') {
            const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
            this.currentGeometry = new THREE.Mesh(sphereGeometry, window.material);
        } else if (geometryType === 'quad') {
            const quadGeometry = new THREE.PlaneGeometry(2, 2);
            this.currentGeometry = new THREE.Mesh(quadGeometry, window.material);
            this.camera.position.z = 1.25;
        }

        this.scene.add(this.currentGeometry);
        this.controls.object = this.camera;
        this.controls.update();
    }
}
