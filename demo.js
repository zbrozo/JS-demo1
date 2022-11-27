"use strict";

document.addEventListener('DOMContentLoaded',() => {
    const start = document.querySelector("[id='title'] a");
    const title = document.getElementById('title');
    const demo = document.getElementById('demo');
    start.addEventListener('click', (event) => {
        loadAndPlayMusic();
        title.style.display = 'none';
        demo.style.display = 'block';
        startDemo();
    });
});

const Letter = function() {
    const letter = document.createElement('div');
    letter.className = 'letter';

    return {
        get element() { return letter; },
        set x(value) { letter.style.left = `${value}px`; },
        set y(value) { letter.style.top = `${value}px`; },
        set text(value) { letter.innerHTML = value; },
        set rotate(value) { letter.style.transform = `rotate(${value}rad)`; },
        set size(value) {
            letter.style.width = `${value}px`;
            letter.style.height = `${value}px`;
            letter.style.fontSize = `${value}px`;
            letter.style.lineHeight = `${value}px`;
        }
    };
};

const Ball = function() {
    const ball = document.createElement('div');
    ball.className = 'ball';
    
    return {
        get element() { return ball; },
        set x(value) { ball.style.left = `${value}px`; },
        set y(value) { ball.style.top = `${value}px`; },
        set z(value) { ball.style.zIndex = `${value}`; },
        set size(value) {
            ball.style.width = `${value}px`;
            ball.style.height = `${value}px`;
        }
    };
};

const generateSinusArray = function(s, max, amp)
{
    const radian = Math.PI / 180;
    
    for (let i = 0; i < max; i++) {
        const deg = i * 360 / max;
        s.push(Math.sin(deg * radian) * amp);
    }
};

const SinusBalls3d = function(playfield) {
    const ballNumber = 20;

    const ballDeg = [0,0,0,0,0];

    // x, x2, y, y2, z
    const config0 = { add: [2,1,-5,3,2], between: [ 60,-50,40,-30,20] };
    const config1 = { add: [2,-5,3,7,0], between: [30,-20,30,10,0] };
    const config2 = { add: [2,-5,3,-3,3], between: [ 20,0,700,0,20] };
    const config3 = { add: [2,-5,3,-10,0], between: [400,0,200,-0,0] };
    const config4 = { start: [0, 0, 256, 0, 0], add: [259,0,-259,0,0], between: [51,0,-51,0,0] };

    let configNr = 0;

    const config = [ config0, config3, config4, config2, config1 ];
    let currentConfig = config[configNr];
    
    const ballSize = 100;
    
    let width = playfield.clientWidth;
    let height = playfield.clientHeight;

    let balls = [];
    let sinus = [];
    let sinus2 = [];

    initConfig();
    createBalls();
    generateSinusArray(sinus, 1024, 1);
    generateSinusArray(sinus2, 1024, 0.5);

    function initConfig() {
        if ('start' in currentConfig) {
            for (let i = 0; i < ballDeg.length; ++i) {
                ballDeg[i] = currentConfig.start[i];
            }
        } else {
            ballDeg.fill(0, 0, ballDeg.length);
        }
    }

    function next() {
        ++configNr;
        if (configNr >= config.length) {
            configNr = 0;
        }

        currentConfig = config[configNr];
        initConfig();
    }
    
    function setScreenSize(w, h) {
        width = w;
        height = h;
    }
    
    function createBalls() {
        for (let i = 0; i < ballNumber; i++) {
            const ball = new Ball();
            playfield.appendChild(ball.element);
            balls.push(ball);
        }
    }

    function processBalls() {
        const sinLength = sinus.length;

        const deg = [...ballDeg];
        
        const areaHeight = height - ballSize;

        for (const ball of balls) {
            let posx = sinus[deg[0]] + sinus2[deg[1]] * 0.8;
            let posy = sinus[deg[2]] + sinus2[deg[3]] * 0.8;
            let posz = sinus[deg[4]];
            
            const distanceX = 700;
            const distanceY = 500;
            posx = posx * ( distanceX / (posz + distanceX));
            posy = posy * ( distanceY / (posz + distanceY));
            posz = posz * 50 + 80;

            ball.z = Math.round(posz);
            ball.size = posz;
            
            posx = posx * ((width/4)-ballSize) + (width/2) - (ballSize/2);
            posy = posy * (areaHeight/3) + (areaHeight/2);

            ball.x = posx;
            ball.y = posy;

            for (let i = 0; i < ballDeg.length; ++i) {
                deg[i] += currentConfig.between[i];
                deg[i] &= sinLength-1;
            }
        }

        for (let i = 0; i < ballDeg.length; ++i) {
            ballDeg[i] += currentConfig.add[i];
            ballDeg[i] &= sinLength-1;
        }
    }
    
    function animate() {
        return new Promise((resolve) => {
            processBalls();
            resolve();
        });
    }
    
    return {
        animate,
        setScreenSize,
        next
    };
};

const Scroller = function(playfield, text) {
    const letterWidth = 80;
    const fontHeight = 100;

    let textPos = 0;
    let textFx = 0;
    let scrollPos = 0;
    let scrollDeg = 0;

    const scrollSpeed = 6;
    const scrollSinSpeed = 2;
    const scrollSinOffset = 20;

    let letters = [];

    let width = playfield.clientWidth;
    let height = playfield.clientHeight;

    createLetters();
    
    function setScreenSize(w, h) {
        width = w;
        height = h;
    }
    
    function removeLetters() {
        letters = [];
    }
    
    function createLetters() {
        for (let i = 0; i < (width/letterWidth)+1; i++) {
            const letter = new Letter();
            letter.size = letterWidth;
            playfield.appendChild(letter.element);
            letters.push(letter);
        }
    }

    const getTextPosAndFx = (pos, fx) => {
        const allowedFx = [ 0, 1, 2 ];
        
        while(true) {
            if (pos >= text.length) {
                pos = 0;
                fx = 0;
            }
            
            const foundChar = text.charCodeAt(pos);
            
            if (allowedFx.includes(foundChar)) {
                fx = foundChar;
            } else {
                return { pos: pos, fx: fx };
            }
            
            ++pos;
        }
    };

    function processChars() {
        let pos = scrollPos;
        let deg = scrollDeg;

        let tpos = textPos;
        let tfx = textFx;
        
        const maxDeg = 360;
        const areaHeight = height - fontHeight;
        const radian = Math.PI / 180;

        for (const letter of letters) {
            const sinus = Math.sin(deg * radian);
            const y = sinus * (areaHeight/2) + (areaHeight/2);

            const found = getTextPosAndFx(tpos, tfx);
            tpos = found.pos;
            tfx = found.fx;
            
            if (tfx === 0) {
                letter.rotate = 0;
            } else if (tfx === 1) {
                letter.rotate = sinus;
            } else if (tfx === 2) {
                letter.rotate = deg * radian;
            }

            letter.x = pos;
            letter.y = y;
            letter.text = text[tpos];

            pos += letterWidth;

            ++tpos;
            deg += scrollSinOffset;
            deg %= maxDeg;
        }

        scrollDeg += scrollSinSpeed;
        scrollPos -= scrollSpeed;

        if (scrollPos <= -letterWidth) {
            scrollDeg += scrollSinOffset;
            scrollPos = 0;

            ++textPos;
            const found =  getTextPosAndFx(textPos, textFx);
            textPos = found.pos;
            textFx = found.fx;
        }

        scrollDeg %= maxDeg;
    }
    
    function animate() {
        return new Promise((resolve) => {
            processChars();
            resolve();
        });
    }

    return {
        animate,
        removeLetters,
        createLetters,
        setScreenSize,
    };
};

const startDemo = function() {
    const playfield = document.getElementById('playfield');
    const balls = new SinusBalls3d(playfield);
    const scroller = new Scroller(playfield, text);

    playfield.addEventListener('click', function() {
        balls.next();
    });
    
    window.addEventListener('resize', function() {
        const w = playfield.clientWidth;
        const h = playfield.clientHeight;

        const domLetters = document.querySelectorAll('.letter');
        for (const letter of domLetters) {
            letter.parentNode.removeChild(letter);
        }

        balls.setScreenSize(w, h);
        scroller.setScreenSize(w, h);
        scroller.removeLetters();
        scroller.createLetters();
    });

    async function animate() {
        //const s = Date.now();
        
        let first = balls.animate();
        //await first;
        let second = scroller.animate();
        //await second;
        
        await Promise.all([first, second]);

        //console.log(Date.now() - s);
        
        requestAnimationFrame(animate);
    }
   
    requestAnimationFrame(animate);
};

const loadAndPlayMusic = function() {
    initMusic();
    const music = Uint8Array.from(atob(amegas), c => c.charCodeAt(0)).buffer;
    const player = window.neoart.Trackers.Soundtracker();
    player.load(music);
    player.play();

    /*    
    var loader = window.neoart.FileLoader();
    var player = loader.player;
    var xmlreq = new XMLHttpRequest();
    
    xmlreq.onload = function(e) {
        if (loader.load(xmlreq.response)) {
            player.play();
        }
    }
    
    xmlreq.open("GET", "amegas.mod", true);
    xmlreq.responseType = "arraybuffer";
    xmlreq.send();
    */
};

const text = "                    "
      + "Hello dudes, this is my first demo in the browser."
      + "      "
      + "\x01This demo was made in november 2022."
      + "      "
      + "Press left mouse button for different balls movements."
      + "      "
      + "\x00If you don't know Amiga or C64 old demo style let me explain that what you see is just sinus balls with a little 3d perspective and DYCP scroll text."
      + " DYCP stands for different Y charset position."
      + "      "
      + "\x02Music comes from amiga's *His Master's Noise* music disk."
      + "\x00     ... let's wrap the text...";
