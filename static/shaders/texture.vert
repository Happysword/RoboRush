#version 300 es
layout(location=0) in vec3 position;
layout(location=1) in vec4 color;
layout(location=2) in vec2 texcoord;
layout(location=3) in vec3 normal;

out vec4 v_color;
out vec2 v_texcoord;
out vec3 v_normal;
out vec3 v_FragPos;
out vec3 v_view;

uniform mat4 MVP;
uniform mat4 VP;
uniform vec3 cam_position;

void main(){
    gl_Position = MVP * vec4(position, 1.0f); 
    v_color = color;
    v_texcoord = texcoord;
    mat4 Model = inverse(VP) * MVP;
    mat4 Model_inverse_transpose = mat4(transpose(inverse(Model)));
    v_normal = (Model_inverse_transpose * vec4(normal, 0.0f)).xyz;
    v_FragPos = vec3(Model * vec4(position, 1.0f));
    v_view = cam_position - v_FragPos;
}