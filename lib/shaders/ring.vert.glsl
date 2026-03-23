varying vec2 vUv;
uniform float uTime;
varying vec3 vPosition;

varying vec3 vNormal;
varying vec3 vViewDir;

float random2D(vec2 value)
{
    return fract(sin(dot(value.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main(){   
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // float glitchTime = uTime - modelPosition.x;
    // float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);

    // glitchStrength /= 4.0;

    // glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
    // glitchStrength *= 0.25;

    // // modelPosition.y += (random2D(modelPosition.xy + uTime) - 0.5) * glitchStrength;
    // modelPosition.z += (random2D(modelPosition.xy + uTime) - 0.5) * glitchStrength;

    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - modelPosition.xyz);
    
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vUv = uv;
    vPosition = modelPosition.xyz;
}