let canvas;var threeDPass,slitScanPass,blurHPass,blurVPass,postProcPass;let slitScanShader,effectShader,blurHShader,blurVShader,img,helvetica;var seed,mainfreq,columns,globalSeed,color1,color2,color3,ww,hh,mm,isTriangled=!0;function fxrandom(r,e){return r&&e?r+fxrand()*(e-r):r&&!e?fxrand()*r:r||e?void 0:fxrand()}function preload(){effectShader=loadShader("assets/effect.vert","assets/effect.frag"),blurVShader=loadShader("assets/blur.vert","assets/blur.frag"),blurHShader=loadShader("assets/blur.vert","assets/blur.frag")}function setup(){pixelDensity(1),mm=min(windowWidth,windowHeight),canvas=createCanvas(mm,mm,WEBGL),canvas.id("ribbons"),ww=hh=1400,threeDPass=createGraphics(2*ww,2*hh,WEBGL),blurHPass=createGraphics(2*ww,2*hh,WEBGL),blurVPass=createGraphics(2*ww,2*hh,WEBGL),postProcPass=createGraphics(2*ww,2*hh,WEBGL),threeDPass.colorMode(HSB,100),imageMode(CENTER),colorMode(HSB,100),rectMode(CENTER),color1=color(0,0,90),color2=color(0,0,22),color3=color(0,0,10),color1=color(65,0,82),color2=color(0,30,22),color2=color(0,0,55),color3=color(0,0,80),color3=color(0,0,12),reset(),show(),show(),noLoop()}function draw(){}var shapes=[],brushsize=40;function show(){background(3),blurHShader.setUniform("tex0",threeDPass),blurHShader.setUniform("texelSize",[1/ww,1/hh]),blurHShader.setUniform("direction",[1,0]),blurHShader.setUniform("u_time",0*frameCount+38108.41),blurHShader.setUniform("amp",.13),blurHPass.shader(blurHShader),blurHPass.quad(-1,-1,1,-1,1,1,-1,1),blurVShader.setUniform("tex0",blurHPass),blurVShader.setUniform("texelSize",[1/ww,1/hh]),blurVShader.setUniform("direction",[0,1]),blurVShader.setUniform("u_time",0*frameCount+38108.41),blurVShader.setUniform("amp",.2),blurVPass.shader(blurVShader),blurVPass.quad(-1,-1,1,-1,1,1,-1,1),effectShader.setUniform("tex0",blurVPass),effectShader.setUniform("tex1",threeDPass),effectShader.setUniform("u_resolution",[ww,hh]),effectShader.setUniform("u_mouse",[ww,hh]),effectShader.setUniform("u_time",frameCount%133),effectShader.setUniform("incolor",[.93,.9,.88,1]),effectShader.setUniform("seed",3810841.411),postProcPass.shader(effectShader),postProcPass.quad(-1,-1,1,-1,1,1,-1,1),image(postProcPass,0,0,mm-18,mm-18)}function resample(r,e){for(var o=[],a=0;a<r.length;a++){var n=a,s=(a+1)%r.length,t=createVector(r[n][0],r[n][1],r[n][2]),f=createVector(r[s][0],r[s][1],r[s][2]),l=p5.Vector.dist(t,f);o.push([t.x,t.y,t.z]);var h=p5.Vector.sub(f,t);if(h.normalize(),l>e){var m=l/round(l/e),i=t.copy();for(h.mult(m);p5.Vector.dist(i,f)>1.64*m;)i.add(h),o.push([i.x,i.y,i.z])}}return o}var nzamp1=225,nzfrq1=.001,nzamp2=5,nzfrq2=.03;function myLine(r,e,o,a,n,s,t,f){let l=dist(e,o,a,n,s,t)/4;r.noFill(),r.beginShape();for(var h=0;h<l;h++){var m=h/(l-1),i=lerp(e,n,m),d=lerp(o,s,m),c=lerp(a,t,m),u=i+nzamp1*(-.5+power(noise(i*nzfrq1+1*frameCount*.003,d*nzfrq1+1*frameCount*.003,c*nzfrq1+831.31+1*frameCount*.003+f*m*m),3))+nzamp2*(-.5+power(noise(i*nzfrq2+1*frameCount*.003,d*nzfrq2+1*frameCount*.003,c*nzfrq2+254.22+1*frameCount*.003+f*m*m),3)),p=d,z=c+nzamp1*(-.5+power(noise(i*nzfrq1+1*frameCount*.003,d*nzfrq1+1*frameCount*.003,c*nzfrq1+524.66+1*frameCount*.003+f*m*m),3))+nzamp2*(-.5+power(noise(i*nzfrq2+1*frameCount*.003,d*nzfrq2+1*frameCount*.003,c*nzfrq2+333.56+1*frameCount*.003+f*m*m),3));r.vertex(u,p,z)}r.endShape()}function myBox(r,e,o,a,n,s,t,f){for(var l=[[[+e/2,+o/2,+a/2],[+e/2,+o/2,-a/2],[+e/2,-o/2,-a/2],[+e/2,-o/2,+a/2]],[[-e/2,+o/2,+a/2],[-e/2,+o/2,-a/2],[-e/2,-o/2,-a/2],[-e/2,-o/2,+a/2]],[[+e/2,+o/2,+a/2],[+e/2,-o/2,+a/2],[-e/2,-o/2,+a/2],[-e/2,+o/2,+a/2]],[[+e/2,+o/2,-a/2],[+e/2,-o/2,-a/2],[-e/2,-o/2,-a/2],[-e/2,+o/2,-a/2]]],h=0;h<l.length;h++){var m=l[h];r.beginShape();let e=resample(m,10);for(var i=0;i<e.length;i++){var d=e[i][0]+n,c=e[i][1]+s,u=e[i][2]+t,p=d+nzamp1*(-.5+power(noise(d*nzfrq1+1*frameCount*.003,c*nzfrq1+1*frameCount*.003,u*nzfrq1+831.31+1*frameCount*.003),3))+nzamp2*(-.5+power(noise(d*nzfrq2+1*frameCount*.003,c*nzfrq2+1*frameCount*.003,u*nzfrq2+254.22+1*frameCount*.003+f),3)),z=c,P=u+nzamp1*(-.5+power(noise(d*nzfrq1+1*frameCount*.003,c*nzfrq1+1*frameCount*.003,u*nzfrq1+524.66+1*frameCount*.003),3))+nzamp2*(-.5+power(noise(d*nzfrq2+1*frameCount*.003,c*nzfrq2+1*frameCount*.003,u*nzfrq2+333.56+1*frameCount*.003+f),3));r.vertex(p,z,P)}r.endShape(CLOSE)}}function resetThree(){randomSeed(globalSeed),noiseSeed(random(1e5));for(var r=Math.floor(random(3)),e=Math.floor(random(3)),o=Math.floor(random(3));r==e||1==r||2!=e&&2!=o;)r=Math.floor(random(3)),e=Math.floor(random(3)),o=Math.floor(random(3));threeDPass.clear(),threeDPass.ortho(-ww/2,ww/2,-hh/2,hh/2,0,4444),0==r?threeDPass.background(color1):1==r?threeDPass.background(color2):threeDPass.background(color3),threeDPass.push(),threeDPass.rotateX(radians(random(-45,45))),threeDPass.rotateY(radians(.3*frameCount*0-45)),threeDPass.translate(0,152,0),threeDPass.scale(1,-1,1),threeDPass.scale(.9),threeDPass.strokeWeight(5);for(var a=50,n=[],s=0;s<11;s++){for(var t=[],f=0;f<11;f++)t.push(0);n.push(t)}for(var l=0;l<10;l+=2)for(var h=0;h<2;h++){var m=-3+round(random(0,6)),i=-3+round(random(0,6)),d=round(random(1,2)),c=(round(random(1,1)),round(random(1,2)));d=2*round(2*power(noise(0*l,123.414+1*h),3))+1,1,c=2*round(2*power(noise(0*l,432.675+1*h),3))+1;let r=createVector(+(d*a/2-0),-25,+(c*a/2-0)),s=createVector(+(d*a/2-0),-25,-(c*a/2-0)),t=createVector(-(d*a/2-0),-25,-(c*a/2-0)),f=createVector(-(d*a/2-0),-25,+(c*a/2-0));r.add(50*m,50*l+a,50*i),s.add(50*m,50*l+a,50*i),t.add(50*m,50*l+a,50*i),f.add(50*m,50*l+a,50*i);var u=n[i+5+(c-1)/2][m+5+(d-1)/2],p=n[i+5-(c-1)/2][m+5+(d-1)/2],z=n[i+5-(c-1)/2][m+5-(d-1)/2],P=n[i+5+(c-1)/2][m+5-(d-1)/2],D=u*a+25,w=p*a+25,C=z*a+25,q=P*a+25;0==u&&(D=0*r.x-144),0==p&&(w=0*s.x-144),0==z&&(C=0*t.x-144),0==P&&(q=0*f.x-144),threeDPass.stroke(0,80,90),threeDPass.stroke(color(65,90-90*l/9,95-25*l/9)),0==e?threeDPass.stroke(color1):1==e?threeDPass.stroke(color2):threeDPass.stroke(color3),threeDPass.strokeWeight(5),myLine(threeDPass,r.x,r.y,r.z,r.x+0*random(-.5,.05),r.y-300-100*noise(l,h)+0*D,r.z+0*random(-.5,.05),.04),myLine(threeDPass,s.x,s.y,s.z,s.x+0*random(-.5,.05),s.y-300-100*noise(l,h)+0*w,s.z-0*random(-.5,.05),.04),myLine(threeDPass,t.x,t.y,t.z,t.x-0*random(-.5,.05),t.y-300-100*noise(l,h)+0*C,t.z-0*random(-.5,.05),.04),myLine(threeDPass,f.x,f.y,f.z,f.x-0*random(-.5,.05),f.y-300-100*noise(l,h)+0*q,f.z+0*random(-.5,.05),.04),threeDPass.strokeWeight(3),myLine(threeDPass,r.x,r.y,r.z,r.x+0*random(-.5,.05),r.y-300-100*noise(l,h)+0*D+random(-10,10),r.z+0*random(-.5,.05),.1),myLine(threeDPass,s.x,s.y,s.z,s.x+0*random(-.5,.05),s.y-300-100*noise(l,h)+0*w+random(-10,10),s.z-0*random(-.5,.05),.1),myLine(threeDPass,t.x,t.y,t.z,t.x-0*random(-.5,.05),t.y-300-100*noise(l,h)+0*C+random(-10,10),t.z-0*random(-.5,.05),.1),myLine(threeDPass,f.x,f.y,f.z,f.x-0*random(-.5,.05),f.y-300-100*noise(l,h)+0*q+random(-10,10),f.z+0*random(-.5,.05),.1),threeDPass.strokeWeight(5),threeDPass.push(),threeDPass.noStroke(),threeDPass.fill(color(65,90,72-72*l/9)),0==o?threeDPass.fill(color1):1==o?threeDPass.fill(color2):threeDPass.fill(color3),myBox(threeDPass,d*a,50,c*a,m*a,l*a+a,i*a,0),threeDPass.noFill(),0==e?threeDPass.stroke(color1):1==e?threeDPass.stroke(color2):threeDPass.stroke(color3),myBox(threeDPass,d*a,50,c*a,m*a,l*a+a,i*a,0),threeDPass.pop();for(var S=0;S<d;S++)for(var b=0;b<c;b++){let r=i+5+b-(c-1)/2,e=m+5+S-(d-1)/2;n[r][e]=max(n[r][e],l+1)}}threeDPass.pop()}function drawRibbon(r,e,o,a,n,s){o?r.beginShape(TRIANGLE_STRIP):r.beginShape(),parts=e.length;for(var t=0;t<parts;t++){parts;var f=e[t][0],l=e[t][1],h=e[t][2],m=f+0*nzamp1*(-.5+power(noise(f*nzfrq1+0*frameCount*.003,l*nzfrq1+0*frameCount*.003,h*nzfrq1+n+831.31+0*frameCount*.003),3))+s*nzamp2*(-.5+power(noise(f*nzfrq2+0*frameCount*.003,l*nzfrq2+0*frameCount*.003,h*nzfrq2+254.22+0*frameCount*.003),3)),i=l,d=h+0*nzamp1*(-.5+power(noise(f*nzfrq1+0*frameCount*.003,l*nzfrq1+0*frameCount*.003,h*nzfrq1+n+524.66+0*frameCount*.003),3))+s*nzamp2*(-.5+power(noise(f*nzfrq2+0*frameCount*.003,l*nzfrq2+0*frameCount*.003,h*nzfrq2+n+333.56+0*frameCount*.003),3));r.vertex(m,i,d),o||a||isTriangled||t%2==1&&(r.endShape(),r.beginShape())}a?r.endShape(CLOSE):r.endShape()}function drawAxis(r){let e=600;r.stroke("#ff0000"),r.line(-e,0,0,e,0,0),r.push(),r.translate(e,0,0),r.noStroke(),r.fill("#ff0000"),r.sphere(5),r.pop(),r.stroke("#00ff00"),r.line(0,-e,0,0,e,0),r.push(),r.translate(0,e,0),r.noStroke(),r.fill("#00ff00"),r.sphere(5),r.pop(),r.stroke("#0000ff"),r.line(0,0,-e,0,0,e),r.push(),r.translate(0,0,e),r.noStroke(),r.fill("#0000ff"),r.sphere(5),r.pop()}function resetRibbon(){for(randomSeed(globalSeed),noiseSeed(random(1e5)),threeDPass.clear(),threeDPass.ortho(-ww/2,ww/2,-hh/2,hh/2,0,4444),chc1=floor(random(3)),chc2=floor(random(3)),chc3=floor(random(3));chc2==chc3||1==chc1||2!=chc2&&2!=chc3;)chc1=floor(random(3)),chc2=floor(random(3)),chc3=floor(random(3));0==chc1?threeDPass.background(color1):1==chc1?threeDPass.background(color2):threeDPass.background(color3),threeDPass.push(),threeDPass.rotateX(radians(random(-22,22))),threeDPass.rotateY(radians(.3*frameCount*0-45)),threeDPass.translate(0,0,0),threeDPass.scale(1,-1,1),threeDPass.scale(.9),threeDPass.strokeWeight(5),isTriangled=random(100)<50;let r=100,e=0,o=round(random(8,13)),a=random(160,330),n=random(31,50);if(n<22){o=round(random(12,23));random(230,330)}var s=[],t=[],f=[],l=random(.003,.012);for(let P=0;P<=r*o;P++){let D=n+0*(-.5+power(noise(.01*P,431.41),3)),w=2*D;var h=power(noise(.4*P),5);let C=P/r*1*w;var m=map(P,0,r*o,-PI/2,PI/2);h=a*(0*cos(m)+.99)+120*(-.5+power(noise(P*l),3));let q=cos(radians(e))*h,S=sin(radians(e))*h;isTriangled&&(e+=1.8);var i=q,d=C,c=S,u=i+1*nzamp1*(-.5+power(noise(i*nzfrq1+1*frameCount*.003,d*nzfrq1+1*frameCount*.003,c*nzfrq1+831.31+1*frameCount*.003),3))+1*nzamp2*(-.5+power(noise(i*nzfrq2+1*frameCount*.003,d*nzfrq2+1*frameCount*.003,c*nzfrq2+254.22+1*frameCount*.003),3)),p=d,z=c+1*nzamp1*(-.5+power(noise(i*nzfrq1+1*frameCount*.003,d*nzfrq1+1*frameCount*.003,c*nzfrq1+524.66+1*frameCount*.003),3))+1*nzamp2*(-.5+power(noise(i*nzfrq2+1*frameCount*.003,d*nzfrq2+1*frameCount*.003,c*nzfrq2+333.56+1*frameCount*.003),3));s.push([u,p,z]),f.push([u,p,z]),q=cos(radians(e))*h,C=P/r*1*w,S=sin(radians(e))*h,d=C+D,c=S,u=(i=q)+1*nzamp1*(-.5+power(noise(i*nzfrq1+1*frameCount*.003,d*nzfrq1+1*frameCount*.003,c*nzfrq1+831.31+1*frameCount*.003),3))+1*nzamp2*(-.5+power(noise(i*nzfrq2+1*frameCount*.003,d*nzfrq2+1*frameCount*.003,c*nzfrq2+254.22+1*frameCount*.003),3)),p=d,z=c+1*nzamp1*(-.5+power(noise(i*nzfrq1+1*frameCount*.003,d*nzfrq1+1*frameCount*.003,c*nzfrq1+524.66+1*frameCount*.003),3))+1*nzamp2*(-.5+power(noise(i*nzfrq2+1*frameCount*.003,d*nzfrq2+1*frameCount*.003,c*nzfrq2+333.56+1*frameCount*.003),3)),t.push([u,p,z]),f.push([u,p,z]),e+=isTriangled?1.8:3.6}let P=t.concat(s.reverse());for(var D=0,w=0,C=0,q=0,S=f.length/2-200;S<f.length/2+200;S++)D+=f[S][0],w+=f[S][1],C+=f[S][2],q++;D/=q,w/=q,C/=q;for(S=0;S<f.length;S++)f[S][0]-=D,f[S][1]-=w,f[S][2]-=C,P[S][0]-=D,P[S][1]-=w,P[S][2]-=C;threeDPass.noStroke(),0==chc2?threeDPass.fill(color1):1==chc2?threeDPass.fill(color2):threeDPass.fill(color3),drawRibbon(threeDPass,f,!0,!1,0,0),0==chc3?threeDPass.stroke(color1):1==chc3?threeDPass.stroke(color2):threeDPass.stroke(color3),threeDPass.strokeWeight(5),threeDPass.noFill(),drawRibbon(threeDPass,f,!1,!1,0,0),threeDPass.pop()}function reset(){globalSeed=round(fxrandom(1e6)),resetRibbon(),seed=random(100),mainfreq=random(3,100),mainfreq=random(100)<150?random(3,13):random(230,400),columns=random(100)<30?random(6,33):random(222,666)}function mouseClicked(){}function touchEnded(){}function keyPressed(){keyCode}function windowResized(){}function power(r,e){return r<.5?.5*pow(2*r,e):1-.5*pow(2*(1-r),e)}const PERLIN_YWRAPB=4,PERLIN_YWRAP=16,PERLIN_ZWRAPB=8,PERLIN_ZWRAP=256,PERLIN_SIZE=4095;let perlin_octaves=4,perlin_amp_falloff=.5;const scaled_cosine=r=>.5*(1-Math.cos(r*Math.PI));let perlin;nnoise=function(r,e=0,o=0){if(null==perlin){perlin=new Array(4096);for(let r=0;r<4096;r++)perlin[r]=fxrand()}r<0&&(r=-r),e<0&&(e=-e),o<0&&(o=-o);let a,n,s,t,f,l=Math.floor(r),h=Math.floor(e),m=Math.floor(o),i=r-l,d=e-h,c=o-m,u=0,p=.5;for(let r=0;r<perlin_octaves;r++){let r=l+(h<<4)+(m<<8);a=scaled_cosine(i),n=scaled_cosine(d),s=perlin[4095&r],s+=a*(perlin[r+1&4095]-s),t=perlin[r+16&4095],t+=a*(perlin[r+16+1&4095]-t),s+=n*(t-s),r+=256,t=perlin[4095&r],t+=a*(perlin[r+1&4095]-t),f=perlin[r+16&4095],f+=a*(perlin[r+16+1&4095]-f),t+=n*(f-t),s+=scaled_cosine(c)*(t-s),u+=s*p,p*=perlin_amp_falloff,l<<=1,i*=2,h<<=1,d*=2,m<<=1,c*=2,i>=1&&(l++,i--),d>=1&&(h++,d--),c>=1&&(m++,c--)}return u};var noiseDetail=function(r,e){r>0&&(perlin_octaves=r),e>0&&(perlin_amp_falloff=e)},noiseSeed=function(r){const e=(()=>{const r=4294967296;let e,o;return{setSeed(a){o=e=(null==a?fxrand()*r:a)>>>0},getSeed:()=>e,rand:()=>(o=(1664525*o+1013904223)%r,o/r)}})();e.setSeed(r),perlin=new Array(4096);for(let r=0;r<4096;r++)perlin[r]=e.rand()};