let canvas;

var threeDPass;
var slitScanPass;
var blurHPass;
var blurVPass;
var postProcPass;

let slitScanShader;
let effectShader;
let blurHShader;
let blurVShader;

let img;
let helvetica;

var seed;
var mainfreq;
var columns;

var globalSeed;

var color1;
var color2;
var color3;

var ww, hh;

var isTriangled = true;


function fxrandom(a, b){
    if(a && b){
        return a + fxrand()*(b-a);
    }
    if(a && !b){
        return fxrand()*a;
    }
    if(!a && !b){
        return fxrand();
    }
}


function preload() {
    effectShader = loadShader('assets/effect.vert', 'assets/effect.frag');
    blurVShader = loadShader('assets/blur.vert', 'assets/blur.frag');
    blurHShader = loadShader('assets/blur.vert', 'assets/blur.frag');
}

var mm;
function setup(){
    pixelDensity(1);
    mm = min(windowWidth, windowHeight);


    canvas = createCanvas(mm, mm, WEBGL);
    canvas.id('ribbons');

    ww = hh = 1400;

    threeDPass = createGraphics(ww*2, hh*2, WEBGL);
    blurHPass = createGraphics(ww*2, hh*2, WEBGL);
    blurVPass = createGraphics(ww*2, hh*2, WEBGL);
    postProcPass = createGraphics(ww*2, hh*2, WEBGL);


    threeDPass.colorMode(HSB, 100);
    imageMode(CENTER);
    colorMode(HSB, 100);
    rectMode(CENTER);

    color1 = color(0, 0, 90);
    color2 = color(0, 0, 22);
    color3 = color(0, 0, 10);

    color1 = color(65, 0, 82);
    color2 = color(0, 30, 22);
    color2 = color(0, 0, 55);
    color3 = color(0, 0, 80);
    color3 = color(0, 0, 12);
    
    reset();
    show();
    show();
}


function draw(){
   
}

var shapes = [];
var brushsize = 40;

function show(){
    background(3);

    //resetRibbon();
    //resetThree();
    blurHShader.setUniform('tex0', threeDPass);
    blurHShader.setUniform('texelSize', [1.0/ww, 1.0/hh]);
    blurHShader.setUniform('direction', [1.0, 0.0]);
    blurHShader.setUniform('u_time', frameCount*0+3810841*.01);
    blurHShader.setUniform('amp', .13);
    blurHPass.shader(blurHShader);
    blurHPass.quad(-1,-1,1,-1,1,1,-1,1);
    
    blurVShader.setUniform('tex0', blurHPass);
    blurVShader.setUniform('texelSize', [1.0/ww, 1.0/hh]);
    blurVShader.setUniform('direction', [0.0, 1.0]);
    blurVShader.setUniform('u_time', frameCount*0+3810841*.01);
    blurVShader.setUniform('amp', .2);
    blurVPass.shader(blurVShader);
    blurVPass.quad(-1,-1,1,-1,1,1,-1,1);

    effectShader.setUniform('tex0', blurVPass);
    effectShader.setUniform('tex1', threeDPass);
    effectShader.setUniform('u_resolution', [ww, hh]);
    effectShader.setUniform('u_mouse', [ww, hh]);
    effectShader.setUniform('u_time', frameCount%133);
    effectShader.setUniform('incolor', [.23, .9, .88, 1.]);
    effectShader.setUniform('seed', 3810841.411);
    postProcPass.shader(effectShader);
    postProcPass.quad(-1,-1,1,-1,1,1,-1,1);
    
    //image(threeDPass, 0, 0, ww-18, hh-18);
    image(postProcPass, 0, 0, mm-18, mm-18);
}


function resample(shape, detail){
    var newshape = [];
    for(var k = 0; k < shape.length; k++){
        var ind1 = k;
        var ind2 = (k+1)%shape.length;
        var p1 = createVector(shape[ind1][0], shape[ind1][1], shape[ind1][2]);
        var p2 = createVector(shape[ind2][0], shape[ind2][1], shape[ind2][2]);

        var d = p5.Vector.dist(p1, p2);

        newshape.push([p1.x, p1.y, p1.z]);

        var dir = p5.Vector.sub(p2, p1);
        dir.normalize();
        if(d > detail){
            var nn = round(d/detail);
            var ndt = d/nn;
            var cp = p1.copy();
            dir.mult(ndt); 
            while(p5.Vector.dist(cp, p2) > ndt*1.64){ // .2 is actually 1.0, but this is safer
                cp.add(dir); 
                newshape.push([cp.x, cp.y, cp.z]);
            }
        }
        
    }
    return newshape;
}

var nzamp1 = 225;
var nzfrq1 = .001;
var nzamp2 = 5;
var nzfrq2 = .03;

function myLine(pg, x1, y1, z1, x2, y2, z2, off){
    
    let d = dist(x1, y1, z1, x2, y2, z2);
    let parts = d / 4;

    pg.noFill();
    pg.beginShape();
    for(var k = 0; k < parts; k++){
        var p = k/(parts-1.);
        var x = lerp(x1, x2, p);
        var y = lerp(y1, y2, p);
        var z = lerp(z1, z2, p);

        var xx = x + nzamp1 * (-.5 + power(noise(x*nzfrq1+1*frameCount*.003, y*nzfrq1+1*frameCount*.003, z*nzfrq1 + 831.31+1*frameCount*.003+0*off*p*p), 3))
                   + nzamp2 * (-.5 + power(noise(x*nzfrq2+1*frameCount*.003, y*nzfrq2+1*frameCount*.003, z*nzfrq2 + 254.22+1*frameCount*.003+0*off*p*p), 3));
        var yy = y;
        var zz = z + nzamp1 * (-.5 + power(noise(x*nzfrq1+1*frameCount*.003, y*nzfrq1+1*frameCount*.003, z*nzfrq1 + 524.66+1*frameCount*.003+0*off*p*p), 3))
                   + nzamp2 * (-.5 + power(noise(x*nzfrq2+1*frameCount*.003, y*nzfrq2+1*frameCount*.003, z*nzfrq2 + 333.56+1*frameCount*.003+0*off*p*p), 3));

        pg.vertex(xx, yy, zz);
    }
    pg.endShape();
}

function myBox(pg, w, h, d, x0, y0, z0, off){

    var shapes = 
    [
        [
            [+w/2, +h/2, +d/2],
            [+w/2, +h/2, -d/2],
            [+w/2, -h/2, -d/2],
            [+w/2, -h/2, +d/2],
        ],
        [
            [-w/2, +h/2, +d/2],
            [-w/2, +h/2, -d/2],
            [-w/2, -h/2, -d/2],
            [-w/2, -h/2, +d/2],
        ],
        /*[
            [+w/2, +h/2, +d/2],
            [+w/2, +h/2, -d/2],
            [-w/2, +h/2, -d/2],
            [-w/2, +h/2, +d/2],
        ],
        [
            [+w/2, -h/2, +d/2],
            [+w/2, -h/2, -d/2],
            [-w/2, -h/2, -d/2],
            [-w/2, -h/2, +d/2],
        ],*/
        [
            [+w/2, +h/2, +d/2],
            [+w/2, -h/2, +d/2],
            [-w/2, -h/2, +d/2],
            [-w/2, +h/2, +d/2],
        ],
        [
            [+w/2, +h/2, -d/2],
            [+w/2, -h/2, -d/2],
            [-w/2, -h/2, -d/2],
            [-w/2, +h/2, -d/2],
        ],
    ];
    
    for(var s = 0; s < shapes.length; s++){
        var shape = shapes[s];
        pg.beginShape();
        let resampled = resample(shape, 10);
        for(var pt = 0; pt < resampled.length; pt++){
            var x = resampled[pt][0] + x0;
            var y = resampled[pt][1] + y0;
            var z = resampled[pt][2] + z0;
            var xx = x + nzamp1 * (-.5 + power(noise(x*nzfrq1+1*frameCount*.003, y*nzfrq1+1*frameCount*.003, z*nzfrq1 + 831.31+1*frameCount*.003), 3))
                       + nzamp2 * (-.5 + power(noise(x*nzfrq2+1*frameCount*.003, y*nzfrq2+1*frameCount*.003, z*nzfrq2 + 254.22+1*frameCount*.003+off), 3));
            var yy = y;
            var zz = z + nzamp1 * (-.5 + power(noise(x*nzfrq1+1*frameCount*.003, y*nzfrq1+1*frameCount*.003, z*nzfrq1 + 524.66+1*frameCount*.003), 3))
                       + nzamp2 * (-.5 + power(noise(x*nzfrq2+1*frameCount*.003, y*nzfrq2+1*frameCount*.003, z*nzfrq2 + 333.56+1*frameCount*.003+off), 3));
            //pg.fill(map(resampled[pt][1], -h/2, h/2, 10, 32));
            pg.vertex(xx, yy, zz);
        }
        pg.endShape(CLOSE);
    }
}

function resetThree(){
    randomSeed(globalSeed);
    noiseSeed(random(100000));

    var chc1 = Math.floor(random(3));
    var chc2 = Math.floor(random(3));
    var chc3 = Math.floor(random(3));
    //while(chc1 == chc2 || chc2 == chc3){
    while(chc1 == chc2 || chc1 == 1 || (chc2!=2 && chc3!=2)){
        chc1 = Math.floor(random(3));
        chc2 = Math.floor(random(3));
        chc3 = Math.floor(random(3));
    }

    threeDPass.clear();
    threeDPass.ortho(-ww/2, ww/2, -hh/2, hh/2, 0, 4444);
    
    if(chc1 == 0)
        threeDPass.background(color1);
    else if(chc1 == 1)
        threeDPass.background(color2);
    else
        threeDPass.background(color3);

    threeDPass.push();
    threeDPass.rotateX(radians(random(-45, 45)));
    threeDPass.rotateY(radians(-45+frameCount*.3*0));
    threeDPass.translate(0, 152, 0);
    //threeDPass.rotateX(radians(90));
    //threeDPass.rotateY(radians(45));
    threeDPass.scale(1, -1, 1);
    threeDPass.scale(.9);
    threeDPass.strokeWeight(5);

    var cellSize = 50;

    var mask = [];
    for(var kk = 0; kk < 11; kk++){
        var asf = [];
        for(var qq = 0; qq < 11; qq++){
            asf.push(0);
        }
        mask.push(asf);
    }

    for(var yoff = 0; yoff < 10; yoff+=2){
        for(var floor = 0; floor < 2; floor++){
            var xoff = -3 + round(random(0, 6));
            var zoff = -3 + round(random(0, 6));

            //xoff = -3 + round(6*power(noise(yoff,323.414+floor*1+frameCount*0.003),3));
            //zoff = -3 + round(6*power(noise(yoff,553.223+floor*1+frameCount*0.003),3));

            var bw = round(random(1, 2))*2+1;
            var bh = round(random(1, 1))*1.;
            var bd = round(random(1, 2))*2+1;

            bw = round(2*power(noise(yoff*.0,123.414+floor*1),3))*2+1;
            bh = 1.;
            bd = round(2*power(noise(yoff*.0,432.675+floor*1),3))*2+1;
        
            let v1 = createVector( +(bw*cellSize/2-5*0), -bh*cellSize/2, +(bd*cellSize/2-5*0) );
            let v2 = createVector( +(bw*cellSize/2-5*0), -bh*cellSize/2, -(bd*cellSize/2-5*0) );
            let v3 = createVector( -(bw*cellSize/2-5*0), -bh*cellSize/2, -(bd*cellSize/2-5*0) );
            let v4 = createVector( -(bw*cellSize/2-5*0), -bh*cellSize/2, +(bd*cellSize/2-5*0) );

            v1.add(+cellSize*xoff, +cellSize*yoff + cellSize, +cellSize*zoff);
            v2.add(+cellSize*xoff, +cellSize*yoff + cellSize, +cellSize*zoff);
            v3.add(+cellSize*xoff, +cellSize*yoff + cellSize, +cellSize*zoff);
            v4.add(+cellSize*xoff, +cellSize*yoff + cellSize, +cellSize*zoff);

            //mask[zoff+5+(bd-1)/2][xoff+5+(bw-1)/2] = yoff+1;
            //mask[zoff+5+(bd-1)/2][xoff+5-(bw-1)/2] = yoff+1;
            //mask[zoff+5-(bd-1)/2][xoff+5-(bw-1)/2] = yoff+1;
            //mask[zoff+5-(bd-1)/2][xoff+5+(bw-1)/2] = yoff+1;
        
            //threeDPass.line(v1.x, v1.y, v1.z, v1.x+12, -133, v1.z+12)
            //threeDPass.line(v2.x, v2.y, v2.z, v2.x+12, -133, v2.z-12)
            //threeDPass.line(v3.x, v3.y, v3.z, v3.x-12, -133, v3.z-12)
            //threeDPass.line(v4.x, v4.y, v4.z, v4.x-12, -133, v4.z+12)

            var i1 = mask[zoff+5+(bd-1)/2][xoff+5+(bw-1)/2];
            var i2 = mask[zoff+5-(bd-1)/2][xoff+5+(bw-1)/2];
            var i3 = mask[zoff+5-(bd-1)/2][xoff+5-(bw-1)/2];
            var i4 = mask[zoff+5+(bd-1)/2][xoff+5-(bw-1)/2];
            var l1 = (i1)*cellSize+cellSize/2;
            var l2 = (i2)*cellSize+cellSize/2;
            var l3 = (i3)*cellSize+cellSize/2;
            var l4 = (i4)*cellSize+cellSize/2;
            if(i1 == 0) l1 = -144 + 0*.3*v1.x;
            if(i2 == 0) l2 = -144 + 0*.3*v2.x;
            if(i3 == 0) l3 = -144 + 0*.3*v3.x;
            if(i4 == 0) l4 = -144 + 0*.3*v4.x;

            if(yoff == 2){
                //print(i1, i2, i3, i4);
            }

            // LEGS
            threeDPass.stroke(0, 80, 90);
            threeDPass.stroke(color(65, 90 - 90*yoff/9., 95 - 25*yoff/9.));
            if(chc2 == 0)
                threeDPass.stroke(color1);
            else if(chc2 == 1)
                threeDPass.stroke(color2);
            else
                threeDPass.stroke(color3);
            threeDPass.strokeWeight(5);
            myLine(threeDPass, v1.x, v1.y, v1.z, v1.x+0*12*random(-.5,.05), v1.y-300-100*noise(yoff,floor)+0*l1, v1.z+0*12*random(-.5,.05), .04);
            myLine(threeDPass, v2.x, v2.y, v2.z, v2.x+0*12*random(-.5,.05), v2.y-300-100*noise(yoff,floor)+0*l2, v2.z-0*12*random(-.5,.05), .04);
            myLine(threeDPass, v3.x, v3.y, v3.z, v3.x-0*12*random(-.5,.05), v3.y-300-100*noise(yoff,floor)+0*l3, v3.z-0*12*random(-.5,.05), .04);
            myLine(threeDPass, v4.x, v4.y, v4.z, v4.x-0*12*random(-.5,.05), v4.y-300-100*noise(yoff,floor)+0*l4, v4.z+0*12*random(-.5,.05), .04);
            threeDPass.strokeWeight(3);
            myLine(threeDPass, v1.x, v1.y, v1.z, v1.x+0*12*random(-.5,.05), v1.y-300-100*noise(yoff,floor)+0*l1+random(-10,10), v1.z+0*12*random(-.5,.05), .1);
            myLine(threeDPass, v2.x, v2.y, v2.z, v2.x+0*12*random(-.5,.05), v2.y-300-100*noise(yoff,floor)+0*l2+random(-10,10), v2.z-0*12*random(-.5,.05), .1);
            myLine(threeDPass, v3.x, v3.y, v3.z, v3.x-0*12*random(-.5,.05), v3.y-300-100*noise(yoff,floor)+0*l3+random(-10,10), v3.z-0*12*random(-.5,.05), .1);
            myLine(threeDPass, v4.x, v4.y, v4.z, v4.x-0*12*random(-.5,.05), v4.y-300-100*noise(yoff,floor)+0*l4+random(-10,10), v4.z+0*12*random(-.5,.05), .1);
            threeDPass.strokeWeight(5);
            
            //threeDPass.translate(xoff*cellSize, yoff*cellSize + cellSize, zoff*cellSize);

            // BOX
            threeDPass.push();
            threeDPass.noStroke();
            threeDPass.fill(color(65, 90, 72 - 72*yoff/9.));
            if(chc3 == 0)
                threeDPass.fill(color1);
            else if(chc3 == 1)
                threeDPass.fill(color2);
            else
                threeDPass.fill(color3);
            //threeDPass.box(bw*cellSize, bh*cellSize, bd*cellSize);
            myBox(threeDPass, bw*cellSize, bh*cellSize, bd*cellSize, xoff*cellSize, yoff*cellSize + cellSize, zoff*cellSize, 0.0);
            
            // BOX CONTOUR
            threeDPass.noFill();
            if(chc2 == 0)
                threeDPass.stroke(color1);
            else if(chc2 == 1)
                threeDPass.stroke(color2);
            else
                threeDPass.stroke(color3);
            //threeDPass.box(bw*cellSize, bh*cellSize, bd*cellSize);
            myBox(threeDPass, bw*cellSize, bh*cellSize, bd*cellSize, xoff*cellSize, yoff*cellSize + cellSize, zoff*cellSize, .0);

            threeDPass.pop();
        
            for(var wi = 0; wi < bw; wi++){
                for(var di = 0; di < bd; di++){
                    let mi = zoff+5+di-(bd-1)/2;
                    let mj = xoff+5+wi-(bw-1)/2;
                    mask[mi][mj] = max(mask[mi][mj], yoff+1)
                }
            }
        }
    }

    /*
    threeDPass.push();
    threeDPass.translate(0, -cellSize/2*0, 0);
    threeDPass.box(11*cellSize, 2, 11*cellSize);
    for(var kk = 0; kk < 11; kk++){
        threeDPass.line((kk-5.5)*cellSize, 0, -5.5*cellSize, (kk-5.5)*cellSize, 0, +5.5*cellSize);
    }
    for(var kk = 0; kk < 11; kk++){
        threeDPass.line(-5.5*cellSize, 0, (kk-5.5)*cellSize, +5.5*cellSize, 0, (kk-5.5)*cellSize);
    }
    
    threeDPass.noStroke();
    threeDPass.fill(40, 100, 0);
    
    for(var kk = 0; kk < 11; kk++){
        for(var qq = 0; qq < 11; qq++){
            var val = mask[kk][qq];
            threeDPass.push();
            threeDPass.translate((qq-5)*cellSize, 0, (kk-5)*cellSize);
            threeDPass.scale(1, -1, 1);
            //threeDPass.text(val, 0, 0);
            if(val == 1){
                threeDPass.box(2,2,2);
            }
            if(val == 2){
                threeDPass.push();
                threeDPass.translate(4, 0, 0);
                threeDPass.box(2,2,2);
                threeDPass.translate(-8, 0, 0);
                threeDPass.box(2,2,2);
                threeDPass.pop();
            }
            if(val == 3){
                threeDPass.push();
                threeDPass.box(2,2,2);
                threeDPass.translate(4, 0, 0);
                threeDPass.box(2,2,2);
                threeDPass.translate(-8, 0, 0);
                threeDPass.box(2,2,2);
                threeDPass.pop();
            }
            threeDPass.pop();
        }
    }
    threeDPass.pop();*/

    threeDPass.pop();
}

function drawRibbon(pg, ribbon, isstrip, close, off, amp){
    if(isstrip)
        pg.beginShape(TRIANGLE_STRIP);
    else
        pg.beginShape();
    
    parts = ribbon.length;
    for(var k = 0; k < parts; k++){
        var p = k/(parts-1.);
        var x = ribbon[k][0];
        var y = ribbon[k][1];
        var z = ribbon[k][2];

        var xx = x + 0*nzamp1 * (-.5 + power(noise(x*nzfrq1+0*frameCount*.003, y*nzfrq1+0*frameCount*.003, z*nzfrq1+off + 831.31+0*frameCount*.003), 3))
                    + amp*nzamp2 * (-.5 + power(noise(x*nzfrq2+0*frameCount*.003, y*nzfrq2+0*frameCount*.003, z*nzfrq2 + 254.22+0*frameCount*.003), 3));
        var yy = y;
        var zz = z + 0*nzamp1 * (-.5 + power(noise(x*nzfrq1+0*frameCount*.003, y*nzfrq1+0*frameCount*.003, z*nzfrq1+off + 524.66+0*frameCount*.003), 3))
                    + amp*nzamp2 * (-.5 + power(noise(x*nzfrq2+0*frameCount*.003, y*nzfrq2+0*frameCount*.003, z*nzfrq2+off + 333.56+0*frameCount*.003), 3));


        pg.vertex(xx, yy, zz);
        if(!isstrip && !close && !isTriangled){
            if(k%2 == 1){
                pg.endShape();
                pg.beginShape();
            }
        }
    }
    if(close)
        pg.endShape(CLOSE);
    else
        pg.endShape();
}

function drawAxis(pg){
    let we = 600;

    pg.stroke('#ff0000');
    pg.line(-we, 0, 0, we, 0, 0);
    pg.push();
    pg.translate(we, 0, 0);
    pg.noStroke();
    pg.fill('#ff0000')
    pg.sphere(5);
    pg.pop();
    
    pg.stroke('#00ff00');
    pg.line(0, -we, 0, 0, we, 0);
    pg.push();
    pg.translate(0, we, 0);
    pg.noStroke();
    pg.fill('#00ff00')
    pg.sphere(5);
    pg.pop();
    
    pg.stroke('#0000ff');
    pg.line(0, 0, -we, 0, 0, we);
    pg.push();
    pg.translate(0, 0, we);
    pg.noStroke();
    pg.fill('#0000ff')
    pg.sphere(5);
    pg.pop();

}

function resetRibbon(){
    randomSeed(globalSeed);
    noiseSeed(random(100000));
    threeDPass.clear();
    threeDPass.ortho(-ww/2, ww/2, -hh/2, hh/2, 0, 4444);
    
    chc1 = floor(random(3));
    chc2 = floor(random(3));
    chc3 = floor(random(3));
    while(chc2 == chc3 || chc1 == 1 || (chc2!=2 && chc3!=2)){
        chc1 = floor(random(3));
        chc2 = floor(random(3));
        chc3 = floor(random(3));
    }


    if(chc1 == 0)
        threeDPass.background(color1);
    else if(chc1 == 1)
        threeDPass.background(color2);
    else
        threeDPass.background(color3);

    threeDPass.push();
    threeDPass.rotateX(radians(random(-22, 22)));
    threeDPass.rotateY(radians(-45+frameCount*.3*0));
    threeDPass.translate(0, 0, 0);
    //threeDPass.rotateX(radians(90));
    //threeDPass.rotateY(radians(45));
    threeDPass.scale(1, -1, 1);
    threeDPass.scale(.9);
    threeDPass.strokeWeight(5);

    //drawAxis(threeDPass);
    isTriangled = random(100) < 50;
    let ptsInLoop = 100;
    let angle = 0;
    let angleStep = 180.0 / ptsInLoop;
    let loops = round(random(8, 13));

    let radius0 = random(160, 330);
    let rwidth0 = random(31, 50);
    let rraise0 = rwidth0*1.5;

    if(rwidth0 < 22){
        loops = round(random(12, 23))
        let radius0 = random(230, 330);
    }

    var downPts = [];
    var upPts = [];
    var allPts = [];

    var rfrq = random(0.003, 0.012)
    // the DISTORTION is done when generating points, in order to calculate center of mass correctly
    for (let i = 0; i <= ptsInLoop*loops; i++) {
        
        let rwidth = rwidth0 + 0*(-.5 + power(noise(i*.01, 431.41), 3));
        let rraise = rwidth*2;

        var radiusr = radius0 + 250*(-.5 + power(noise(i*.4), 5));
        let py = 1.*(i/ptsInLoop) * rraise;
        var ang = map(i, 0, ptsInLoop*loops, -PI/2, PI/2);
        radiusr = radius0*(.0*cos(ang) + .99) + 120*(-.5 + power(noise(i*rfrq), 3));
        let px = cos(radians(angle)) * radiusr;
        let pz = sin(radians(angle)) * radiusr;
        if(isTriangled)
            angle += angleStep;
        //threeDPass.vertex(px, py, pz);

        var x = px;
        var y = py;
        var z = pz;
        var xx = x + 1*nzamp1 * (-.5 + power(noise(x*nzfrq1+1*frameCount*.003, y*nzfrq1+1*frameCount*.003, z*nzfrq1 + 831.31+1*frameCount*.003), 3))
                    + 1*nzamp2 * (-.5 + power(noise(x*nzfrq2+1*frameCount*.003, y*nzfrq2+1*frameCount*.003, z*nzfrq2 + 254.22+1*frameCount*.003), 3));
        var yy = y;
        var zz = z + 1*nzamp1 * (-.5 + power(noise(x*nzfrq1+1*frameCount*.003, y*nzfrq1+1*frameCount*.003, z*nzfrq1 + 524.66+1*frameCount*.003), 3))
                    + 1*nzamp2 * (-.5 + power(noise(x*nzfrq2+1*frameCount*.003, y*nzfrq2+1*frameCount*.003, z*nzfrq2 + 333.56+1*frameCount*.003), 3));


        downPts.push([xx, yy, zz])
        allPts.push([xx, yy, zz])
        px = cos(radians(angle)) * radiusr;
        py = 1.*(i/ptsInLoop) * rraise;
        pz = sin(radians(angle)) * radiusr;
        //threeDPass.vertex(px, py+rwidth, pz);
        
        x = px;
        y = py+rwidth;
        z = pz;
        xx = x + 1*nzamp1 * (-.5 + power(noise(x*nzfrq1+1*frameCount*.003, y*nzfrq1+1*frameCount*.003, z*nzfrq1 + 831.31+1*frameCount*.003), 3))
               + 1*nzamp2 * (-.5 + power(noise(x*nzfrq2+1*frameCount*.003, y*nzfrq2+1*frameCount*.003, z*nzfrq2 + 254.22+1*frameCount*.003), 3));
        yy = y;
        zz = z + 1*nzamp1 * (-.5 + power(noise(x*nzfrq1+1*frameCount*.003, y*nzfrq1+1*frameCount*.003, z*nzfrq1 + 524.66+1*frameCount*.003), 3))
               + 1*nzamp2 * (-.5 + power(noise(x*nzfrq2+1*frameCount*.003, y*nzfrq2+1*frameCount*.003, z*nzfrq2 + 333.56+1*frameCount*.003), 3));

        upPts.push([xx, yy, zz])
        allPts.push([xx, yy, zz])
        if(isTriangled)
            angle += angleStep;
        else
            angle += angleStep*2;
    }

    let allPtsLoop = upPts.concat(downPts.reverse());

    
    var mx = 0;
    var my = 0;
    var mz = 0;
    var nn = 0;
    for(var k = allPts.length/2 - 2*ptsInLoop; k < allPts.length/2 + 2*ptsInLoop; k++){
        mx += allPts[k][0];
        my += allPts[k][1];
        mz += allPts[k][2];
        //allPts[k][0] *= 2;
        //allPts[k][2] *= 2;
        nn++;
    }
    mx = mx / nn;
    my = my / nn;
    mz = mz / nn;
    for(var k = 0; k < allPts.length; k++){
        allPts[k][0] -= mx;
        allPts[k][1] -= my;
        allPts[k][2] -= mz;
        allPtsLoop[k][0] -= mx;
        allPtsLoop[k][1] -= my;
        allPtsLoop[k][2] -= mz;
    }
    
    threeDPass.noStroke();
    if(chc2 == 0)
        threeDPass.fill(color1);
    else if(chc2 == 1)
        threeDPass.fill(color2);
    else
        threeDPass.fill(color3);
    drawRibbon(threeDPass, allPts, true, false, 0.0, 0.0); //pg, points, isStrip, CLOSE, off, amp
    
    if(chc3 == 0)
        threeDPass.stroke(color1);
    else if(chc3 == 1)
        threeDPass.stroke(color2);
    else
        threeDPass.stroke(color3);
    threeDPass.strokeWeight(5);
    threeDPass.noFill();
    if(false)
        drawRibbon(threeDPass, allPtsLoop, false, true, 0.0, 0.0);
    else
        drawRibbon(threeDPass, allPts, false, false, 0.0, 0.0);

    threeDPass.pop();
}

function reset(){
    globalSeed = round(fxrandom(1000000));

    resetRibbon();
    //resetThree();

    seed = random(100.);
    mainfreq = random(3., 100.);
    if(random(100) < 150)
        mainfreq = random(3, 13);
    else
        mainfreq = random(230, 400);
    
    if(random(100) < 30)
        columns = random(6., 33);
    else
        columns = random(222, 666);
    
}

function mouseClicked(){
    //reset();
}

function touchEnded(){
    //reset();
}

function keyPressed(){
    if (keyCode == 65) {
        //reset();
    }
    //save(postProcPass, 'myImage.png');
}


function windowResized() {
    //mm = min(800, min(ww, hh));
    
    //ww = windowWidth;
    //hh = windowHeight;
    //ww = hh/1.;
    //resizeCanvas(ww, hh);

    //reset();
    //show();
}

function power(p, g) {
    if (p < 0.5)
    return 0.5 * pow(2*p, g);
    else
    return 1 - 0.5 * pow(2*(1 - p), g);
}


const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;

let perlin_octaves = 4; 
let perlin_amp_falloff = 0.5; 

const scaled_cosine = i => 0.5 * (1.0 - Math.cos(i * Math.PI));
let perlin;


nnoise = function(x, y = 0, z = 0) {
    if (perlin == null) {
        perlin = new Array(PERLIN_SIZE + 1);
        for (let i = 0; i < PERLIN_SIZE + 1; i++) {
            perlin[i] = fxrand();
        }
    }
    
    if (x < 0) {
        x = -x;
    }
    if (y < 0) {
        y = -y;
    }
    if (z < 0) {
        z = -z;
    }
    
    let xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z);
    let xf = x - xi;
    let yf = y - yi;
    let zf = z - zi;
    let rxf, ryf;
    
    let r = 0;
    let ampl = 0.5;
    
    let n1, n2, n3;
    
    for (let o = 0; o < perlin_octaves; o++) {
        let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
        
        rxf = scaled_cosine(xf);
        ryf = scaled_cosine(yf);
        
        n1 = perlin[of & PERLIN_SIZE];
        n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
        n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
        n1 += ryf * (n2 - n1);
        
        of += PERLIN_ZWRAP;
        n2 = perlin[of & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
        n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
        n2 += ryf * (n3 - n2);
        
        n1 += scaled_cosine(zf) * (n2 - n1);
        
        r += n1 * ampl;
        ampl *= perlin_amp_falloff;
        xi <<= 1;
        xf *= 2;
        yi <<= 1;
        yf *= 2;
        zi <<= 1;
        zf *= 2;
        
        if (xf >= 1.0) {
            xi++;
            xf--;
        }
        if (yf >= 1.0) {
            yi++;
            yf--;
        }
        if (zf >= 1.0) {
            zi++;
            zf--;
        }
    }
    return r;
};

var noiseDetail = function(lod, falloff) {
    if (lod > 0) {
        perlin_octaves = lod;
    }
    if (falloff > 0) {
        perlin_amp_falloff = falloff;
    }
};

var noiseSeed = function(seed) {
    const lcg = (() => {
        const m = 4294967296;
        const a = 1664525;
        const c = 1013904223;
        let seed, z;
        return {
            setSeed(val) {
                z = seed = (val == null ? fxrand() * m : val) >>> 0;
            },
            getSeed() {
                return seed;
            },
            rand() {
                z = (a * z + c) % m;
                return z / m;
            }
        };
    })();
    
    lcg.setSeed(seed);
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
        perlin[i] = lcg.rand();
    }
};
