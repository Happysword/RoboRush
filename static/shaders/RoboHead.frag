#version 300 es
precision highp float;

in vec4 v_color;
in vec2 v_texcoord;
in vec3 v_normal;
in vec3 v_FragPos;
in vec3 v_view;
in vec3 v_world;

out vec4 color;

uniform vec4 tint;
uniform sampler2D texture_sampler;
uniform vec3 cam_position;

vec3 lightAmbient = vec3(0.4,0.4,0.4);
vec3 lightDiffuse = vec3(0.5,0.5,0.5);
vec3 lightSpecular = vec3(1.0,1.0,1.0);
vec3 lightDirection = vec3(-0.4,-0.8,0.5);

vec3 materialDiffuse = vec3(0.0,0.0,0.0);
float materialShiniess = 64.0*4.0;
vec3 materialSpecular = vec3(0.0,0.0,0.0);

void main(){
    
    // ambient
    vec4 texture_sampler_temp = texture(texture_sampler, v_texcoord);
    vec3 ambient = lightAmbient * texture_sampler_temp.xyz;

    // diffuse 
    vec3 norm = normalize(v_normal);
    vec3 lightDir = normalize(-lightDirection);  
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = lightDiffuse * diff;

    // specular
    vec3 viewDir = normalize(v_view - v_FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), materialShiniess);
    vec3 specular = lightSpecular * spec;  

    vec3 result = ambient + diffuse + specular;
    color = vec4(result, 1.0) * tint;
}