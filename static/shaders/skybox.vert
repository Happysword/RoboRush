#version 300 es
layout(location=0) in vec3 position;

out vec3 v_view;

uniform mat4 M;
uniform mat4 VP;
uniform vec3 cam_position;


void main(){
    vec4 world = M * vec4(position, 1.0f);
    gl_Position = (VP * world).xyww; // z is always = 1 ti make it as far as possible (to make it render last for optimization)
    v_view = world.xyz - cam_position;
}