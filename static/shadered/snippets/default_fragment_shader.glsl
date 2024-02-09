precision highp float;

// Inputs from vertex shader
in vec3 fragPosition; // Position of the fragment
in vec3 fragNormal; // Normal of the fragment
in vec2 fragTexCoord; // Texture coordinates of the fragment

// Example output
out vec4 outColor; // Output color of the fragment

// Uniforms
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uCameraPosition;

void main() {
    // Simple example: modulate the output color with the normal vector to visualize it
    outColor = vec4(normalize(fragNormal) * 0.5 + 0.5, 1.0);
}
