import {projectedOrbitTexture} from './space-rendering';
let canvas:HTMLCanvasElement|null=null,gl:WebGLRenderingContext|null=null,attempted=false,program:WebGLProgram|null=null;
const textures=new WeakMap<HTMLCanvasElement,WebGLTexture>();
function prepare(){
 if(attempted)return;attempted=true;
 try{
  canvas=document.createElement('canvas');gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,preserveDrawingBuffer:true,powerPreference:'low-power'});if(!gl)return;
  const shader=(kind:number,source:string)=>{const s=gl!.createShader(kind)!;gl!.shaderSource(s,source);gl!.compileShader(s);if(!gl!.getShaderParameter(s,gl!.COMPILE_STATUS))throw new Error(gl!.getShaderInfoLog(s)??'Globe shader');return s;};
  program=gl.createProgram()!;gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 v;uniform sampler2D image;uniform float phase;void main(){float r=dot(v,v);if(r>=1.){gl_FragColor=vec4(0.);return;}float z=sqrt(max(0.,1.-r));vec2 uv=vec2(fract(atan(v.x,z)/6.2831853+phase),asin(v.y)/3.14159265+.5);vec4 c=texture2D(image,uv);c.a*=smoothstep(1.,.985,r);gl_FragColor=c;}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Globe program link');gl.useProgram(program);
  const vertices=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertices);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);gl.uniform1i(gl.getUniformLocation(program,'image'),0);
 }catch(error){console.warn('[planet projection]',error);gl=null;}
}
/** One analytic GPU projection per globe replaces synchronized row-by-row CPU
 * reprojection spikes. The existing painted source remains the texture. */
export function projectedPlanetTexture(source:HTMLCanvasElement,rotation:number,resolution=512){
 prepare();if(!gl||!canvas||!program)return projectedOrbitTexture(source,rotation,resolution);
 if(canvas.width!==resolution||canvas.height!==resolution){canvas.width=canvas.height=resolution;gl.viewport(0,0,resolution,resolution);}
 gl.useProgram(program);gl.activeTexture(gl.TEXTURE0);let texture=textures.get(source);
 if(!texture){texture=gl.createTexture()!;textures.set(source,texture);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}else gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.uniform1f(gl.getUniformLocation(program,'phase'),((rotation*.06)%1+1)%1);gl.drawArrays(gl.TRIANGLES,0,6);
 delete canvas.dataset.planetSurfaceAsset;canvas.dataset.projectionMode='gpu-spherical';return canvas;
}
