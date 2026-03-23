#define PI 3.14159265359

uniform float uTime;

uniform vec3  uBaseColor1;
uniform vec3  uBaseColor2;
uniform float uBaseOpacity;
uniform vec3  uFresnelColor;
uniform float uFresnelPower;
uniform float uFresnelStrength;
uniform float uFresnelBias;
uniform vec3  uLightDir;

varying vec3 vViewDir;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main(){  
    

    // Base layer
        
    float strength = sin((vUv.x - uTime * 0.03) * PI *  16.0);
    vec3 baseColour =  mix(uBaseColor1, uBaseColor2, strength);

    float diff = max(dot(vNormal, uLightDir), 0.5);
    float ambient = 0.5;
    vec3 baseShaded = baseColour * (ambient + diff * 0.75);

    // Fresnel layer
    float NdotV = dot(vNormal, vViewDir);
    float fresnel = uFresnelBias + uFresnelStrength * pow(clamp(1.0 - NdotV, 0.0, 1.0), uFresnelPower);
 
    vec3 finalColor = baseShaded + fresnel * uFresnelColor;
 
    gl_FragColor = vec4(finalColor, uBaseOpacity);
}