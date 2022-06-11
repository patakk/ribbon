precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec4 incolor;
uniform float u_time;
uniform float seed;
uniform sampler2D tex0;
uniform sampler2D tex1;
varying vec2 vTexCoord;

float randomNoise(vec2 p) {
  return fract(16791.414*sin(7.*p.x+p.y*73.41));
}

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float noise3 (in vec2 _st, in float t) {
    vec2 i = floor(_st+t);
    vec2 f = fract(_st+t);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float fbm3 ( in vec2 _st, in float t) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise3(_st, t);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}



void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    vec2 st = uv*vec2(3.2, 3.)*3.24;
    uv = uv/2.;
    uv.y = 1. - uv.y;
    //st += st * abs(sin(u_time*0.002)*3.0);
    vec3 color = vec3(0.0);

    vec2 q = vec2(0.);
    q.x = fbm3( st + 0.1, u_time*.08);
    q.y = fbm3( st + vec2(1.0), u_time*.08);

    vec2 r = vec2(0.);
    r.x = fbm3( st + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time, u_time*.08);
    r.y = fbm3( st + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time, u_time*.08);

    float f = fbm3(st+r, u_time*.08);

    color = mix(vec3(0.101961,0.619608,0.666667),
                vec3(0.666667,0.666667,0.498039),
                clamp((f*f)*4.0,0.0,1.0));

    color = mix(color,
                vec3(0,0,0.164706),
                clamp(length(q),0.0,1.0));

    color = mix(color,
                vec3(0.666667,1,1),
                clamp(length(r.x),0.0,1.0));

    float ff = (f*f*f+0.120*f*f+.5*f);
    ff = 1.*ff;
    ff *= 0.01*.22;
    
    vec2 uvr = uv - vec2(1., 0.)/u_resolution*.7*0.;
    vec2 uvg = uv;
    vec2 uvb = uv + vec2(1., 0.)/u_resolution*.7*0.;
    
    vec2 uvrd = uv - .11*ff*vec2(1., 0.) - 333.5*ff*vec2(1., 0.)/u_resolution*2.;
    vec2 uvgd = uv - .11*ff*vec2(1., 0.)*1.00;
    vec2 uvbd = uv - .11*ff*vec2(1., 0.) + 333.5*ff*vec2(1., 0.)/u_resolution*2.;

    float cr = texture2D(tex0, uvr).r;
    float cg = texture2D(tex0, uvg).g;
    float cb = texture2D(tex0, uvb).b;
    vec4 imgc = vec4(cr, cg, cb, 1.0);

    float crd = texture2D(tex0, uvrd).r;
    float cgd = texture2D(tex0, uvgd).g;
    float cbd = texture2D(tex0, uvbd).b;
    vec4 imgd = vec4(crd, cgd, cbd, 1.0);
    //imgd.gb *= 0.;
    //imgd.r = 1. - imgd.r;

    float rndm = random(gl_FragCoord.xy/500.+seed/100000.+fbm(uv)+u_time*.01);
    float p = 0.5;
    //vec4 outc = imgc*p + (1.-p)*imgd;
    vec4 outc = (1. - (1. - imgd)*imgc);
    outc = 1. - (1.-imgc)*(1.-imgd);
    //outc = 1. - (1.-imgd)*(1.-imgg);

    float pp = ff*14.;
    //outc = pp*imgc + (1.-pp)*imgg;
    //outc.rgb = vec3(pp);
    //outc = (imgd*.75 + imgg*.25) + .15*(-.5 + rndm);

    float bluem = pow((1.-imgd.r)*imgc.r, 3.);
    bluem = smoothstep(0.0, 0.16, bluem);
    vec4 blue = bluem*vec4(0., .0, 0.98, 1.);

    vec4 imgg = texture2D(tex1, uv);
    vec4 imggr = texture2D(tex1, uv + vec2(-.1, .03));

    outc = blue*bluem + imgd*(1.-bluem) + .15*(-.5 + rndm);
    ff = smoothstep(0.001, 0.004, ff);
    outc = (imgc*.4 + imgd*.45 + imgg*.15) + .127*(-.5 + rndm);
    outc = (imgc*.0 + imgd*.65 + imgg*.35) + .087*(-.5 + rndm);
    vec4 rra = imggr + .127*(-.5 + rndm);

    //outc = max(outc, rra);
    //outc.rgb = incolor.rgb;

    rra.a = 1.0;
    outc.a = 1.0;

    gl_FragColor = outc;
    
    //gl_FragColor = vec4(ff*vec3(1.),1.);
    //gl_FragColor = vec4(1.,0.,0.,1.);

}