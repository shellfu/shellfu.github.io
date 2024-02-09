#version 450

layout(std140, binding = 0) uniform Uniforms {
    mat4 modelMatrix;
    mat4 viewMatrix;
    mat4 modelViewMatrix;
    mat4 projectionMatrix;
    mat3 normalMatrix;
};

// Specify locations for each input attribute
layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec2 uv;

// Specify locations for outputs to the fragment shader
layout(location = 0) out vec3 fragPosition;
layout(location = 1) out vec3 fragNormal;
layout(location = 2) out vec2 fragTexCoord;

void main() {
    fragPosition = vec3(modelMatrix * vec4(position, 1.0));
    fragNormal = normalize(normalMatrix * normal);
    fragTexCoord = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
