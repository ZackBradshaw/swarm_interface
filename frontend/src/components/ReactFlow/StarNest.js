// ShaderCanvas.js
import React, { useRef, useEffect } from 'react';

const StarNest = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `);
    gl.compileShader(vertexShader);

    // Fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
      precision highp float;

      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;

      // Define iterations, formuparam, etc.
      // ...

      Image( out vec4 fragColor, in vec2 fragCoord ){
      //get coords and direction
      vec2 uv=fragCoord.xy/iResolution.xy-.5;
      uv.y*=iResolution.y/iResolution.x;
      vec3 dir=vec3(uv*zoom,1.);
      float time=iTime*speed+.25;

      //mouse rotation
      float a1=.5+iMouse.x/iResolution.x*2.;
      float a2=.8+iMouse.y/iResolution.y*2.;
      mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
      mat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
      dir.xz*=rot1;
      dir.xy*=rot2;
      vec3 from=vec3(1.,.5,0.5);
      from+=vec3(time*2.,time,-2.);
      from.xz*=rot1;
      from.xy*=rot2;
      
      //volumetric rendering
      float s=0.1,fade=1.;
      vec3 v=vec3(0.);
      for (int r=0; r<volsteps; r++) {
        vec3 p=from+s*dir*.5;
        p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
        float pa,a=pa=0.;
        for (int i=0; i<iterations; i++) { 
          p=abs(p)/dot(p,p)-formuparam; // the magic formula
          a+=abs(length(p)-pa); // absolute sum of average change
          pa=length(p);
        }
        float dm=max(0.,darkmatter-a*a*.001); //dark matter
        a*=a*a; // add contrast
        if (r>6) fade*=1.-dm; // dark matter, don't render near
        //v+=vec3(dm,dm*.5,0.);
        v+=fade;
        v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance
        fade*=distfading; // distance fading
        s+=stepsize;
      }
      v=mix(vec3(length(v)),v,saturation); //color adjust
      fragColor = vec4(v*.01,1.);	
  }
  
      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec4 fragColor;
        mainImage(fragColor, fragCoord);
        gl_FragColor = fragColor;
      }
    `);
    gl.compileShader(fragmentShader);

    // Shader program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up uniforms (iResolution, iTime, iMouse)
    // ...

    // Set up buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0]),
      gl.STATIC_DRAW
    );

    // Animation loop function
    const render = (time) => {
      // Update uniforms (iTime) and draw scene
      gl.uniform2f(gl.getUniformLocation(program, 'iResolution'), width, height);
      gl.uniform1f(gl.getUniformLocation(program, 'iTime'), time * 0.001);
      // iMouse uniform should be updated based on mouse events
      // ...

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(render);
    };

    render();

    return () => {
      // Cleanup if necessary
    };
  }, [width, height]);

  return (
    <canvas ref={canvasRef} width={width} height={height} />
  );
};

export default StarNest;
