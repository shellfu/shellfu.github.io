precision highp float;

// Inputs from vertex shader
in vec3 fragPosition; // Position of the fragment in world space
in vec3 fragNormal;   // Normal of the fragment in view space
in vec2 fragTexCoord;  // Texture coordinates of the fragment

// Outputs to WebGL's framebuffer
out vec4 outColor; // Output color of the fragment

uniform float uTime;
uniform vec2 uResolution;

// Atmospheric and lighting constants
const vec3 sunDirection = normalize(vec3(0.0, 1.0, 0.0)); // Direction to the sun
const vec3 betaR = vec3(0.0025, 0.01, 0.015); // Rayleigh scattering coefficients for RGB
const vec3 betaM = vec3(0.0003); // Mie scattering coefficient (simplified for all channels)
const float hR = 0.25; // Scale height for Rayleigh scattering
const float hM = 0.1; // Scale height for Mie scattering
const float earthRadius = 1.0; // Normalized Earth radius
const float atmosphereRadius = 1.025; // Normalized atmosphere radius

// Function to calculate Rayleigh phase function
float rayleighPhase(float cosTheta) {
    return (3.0 / (16.0 * 3.14159265)) * (1.0 + cosTheta * cosTheta);
}

// Function to calculate Mie phase function (simplified Henyey-Greenstein)
float miePhase(float cosTheta, float g) {
    float g2 = g * g;
    return (1.0 - g2) / (4.0 * 3.14159265 * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}

vec3 calculateSunDirection(float time) {
    float angle = time * 0.1; // Control the speed of the sun's movement
    return normalize(vec3(sin(angle), cos(angle), 0.0));
}

void main() {
    // Use uTime to calculate dynamic sun direction
    vec3 sunDirection = calculateSunDirection(uTime);

    // Your existing shader code...
    vec3 rayDir = normalize(fragPosition - vec3(0.0, earthRadius, 0.0));
    float cosAngle = dot(rayDir, sunDirection);
    float rPhase = rayleighPhase(cosAngle);
    float mPhase = miePhase(cosAngle, 0.76); // Use the dynamic sun direction

    // Calculate optical depth for Rayleigh and Mie scattering
    float opticalDepthR = exp(-fragPosition.y / hR);
    float opticalDepthM = exp(-fragPosition.y / hM);

    // Calculate scattering
    vec3 scatterR = betaR * rPhase * opticalDepthR;
    vec3 scatterM = betaM * mPhase * opticalDepthM;
    vec3 color = (scatterR + scatterM) * max(0.0, sunDirection.y); // Use the dynamic sun direction

    vec3 sunlightIntensity = vec3(6.5); // Adjust brightness
    color *= sunlightIntensity;

    // Ensure color is within a valid range
    color = clamp(color, 0.0, 1.0);

    outColor = vec4(color, 1.0);
}
