// Uniforms documentation: https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
uniform mat4 modelMatrix; // Model matrix
uniform mat4 viewMatrix; // View matrix
uniform mat4 modelViewMatrix; // ModelView matrix, combining model and view
uniform mat4 projectionMatrix; // Projection matrix
uniform mat3 normalMatrix; // Normal matrix for transforming normals

// Attributes / Inputs from the vertex buffer
in vec3 position; // Vertex position
in vec3 normal; // Normal vector
in vec2 uv; // Texture coordinates, assuming 'uv' is the attribute name used

// Outputs to fragment shader
out vec3 fragPosition; // Position of the fragment
out vec3 fragNormal; // Normal of the fragment
out vec2 fragTexCoord; // Texture coordinates of the fragment

void main() {
    // Transform vertex position to world space
    fragPosition = vec3(modelMatrix * vec4(position, 1.0));
    // Transform normal to view space
    fragNormal = normalize(normalMatrix * normal);
    // Pass texture coordinates through
    fragTexCoord = uv;

    // Calculate final vertex position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
