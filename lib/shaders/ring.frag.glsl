varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;


void main(){  
    
    float strength = sin((vUv.x - uTime *0.02) * 3.14159265359 *  16.0);

    vec3 viewDirection = normalize(vPosition - cameraPosition);
    
    float fresnel = dot(viewDirection, vNormal);
    fresnel = pow(fresnel, 4.0);
    float falloff = smoothstep(1.0, 0.0, fresnel);

    
    vec3 color =  mix(vec3(0.263, 0.38, 0.933), vec3(1.0), strength * falloff);
    // float intensity = 1.05 - dot(vNormal, vec3(0.0, 0.0, 0.0));
    vec4 glow = vec4(color, falloff);
    // * pow(intensity, 9.0);  
    
    // Output to screen
    // gl_FragColor = glow;
    gl_FragColor = glow;
}