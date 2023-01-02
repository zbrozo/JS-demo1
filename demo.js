
"use strict";

document.addEventListener('DOMContentLoaded',() => {
    const start = document.querySelector("[class='title'] a");
    const title = document.querySelector('.title');
    const demo = document.querySelector('.demo');
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

const Field = function() {
    const ball = document.createElement('div');
    ball.className = 'chessfield';
    
    return {
        get element() { return ball; },
        set x(value) { ball.style.left = `${value}px`; },
        set y(value) { ball.style.top = `${value}px`; },
        set z(value) { ball.style.zIndex = `${value}`; },
        set size(value) {
            ball.style.width = `${value}px`;
            ball.style.height = `${value}px`;
        },
        //get x() { return parseInt(ball.style.left, 10); },
        //get y() { return parseInt(ball.style.top, 10); }
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

    const transformSteps = 200;
    let transformStep = 0;
    
    let currDeg = [0,0,0,0,0];
    let nextDeg = [0,0,0,0,0];
    
    // x, x2, y, y2, z, 
    const config0 = { add: [2,1,-5,3,2], between: [ 60,-50,40,-30,20], scale: [1, 0.5] };
    const config1 = { add: [2,-5,3,7,0], between: [30,-20,30,10,0], scale: [1, 0.5] };
    const config2 = { add: [2,-5,3,-3,3], between: [ 20,0,700,0,20], scale: [1, 0.5] };
    const config3 = { add: [2,-5,3,-10,0], between: [400,0,200,0,0], scale: [1, 0.5] };
    const config4 = { start: [0, 0, 256, 0, 0], add: [4,0,-4,0,0], between: [51,0,-51,0,0], scale: [1, 0.5] };
    const config5 = { start: [0, 0, 256, 0, 0], add: [5,3,-5,3,0], between: [40,0,-40,0,10], scale: [1, 0.7] };
    const config6 = { start: [0, 0, 256, 0, 0], add: [3,7,-3,9,0], between: [51,0,-51,0,0], scale: [1, 0.8] };
    const config7 = { add: [2,-0,6,-2,0], between: [-40,0,80,20,0], scale: [1, 0.8] };
    
    let configNr = 0;
    const config = [ config0, config3, config7, config4, config2, config1, config6, config5 ];
    let currConfig = config[configNr];
    let nextConfig;
    
    const ballSize = 100;
    
    let width = playfield.clientWidth;
    let height = playfield.clientHeight;

    let currPositions = [];
    let nextPositions = [];
    
    let balls = [];
    let sinus = [];

    initConfig(currDeg, currConfig);
    createBalls();
    generateSinusArray(sinus, 1024, 1);
    
    function initTransform() {
        let nr = configNr;
        ++nr;
        if (nr >= config.length) {
            nr = 0;
        }

        nextConfig = config[nr];
        initConfig(nextDeg, nextConfig);
        transformStep = 1;
    }

    function processTransform() {
        nextPositions = calcBalls(nextDeg, nextConfig);
       
        for (let i = 0; i < ballNumber; i++) {
            let x = currPositions[i][0] + ((nextPositions[i][0] - currPositions[i][0]) / transformSteps) * transformStep;
            let y = currPositions[i][1] + ((nextPositions[i][1] - currPositions[i][1]) / transformSteps) * transformStep;
            let z = currPositions[i][2] + ((nextPositions[i][2] - currPositions[i][2]) / transformSteps) * transformStep;
            nextPositions[i] = [x,y,z];
        }

        ++transformStep;
        
        return (transformStep != transformSteps);
    }
    
    function initConfig(deg, config) {
        if ('start' in config) {
            for (let i = 0; i < deg.length; ++i) {
                deg[i] = config.start[i];
            }
        } else {
            deg.fill(0, 0, deg.length);
        }
    }

    function next() {
        ++configNr;
        if (configNr >= config.length) {
            configNr = 0;
        }
        currConfig = config[configNr];
        
        initConfig(currDeg, currConfig);
        currDeg = [...nextDeg];
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

    function calcBalls(deg, config) {
        let positions = [];
        
        const sinLength = sinus.length;

        const tmpDeg = [...deg];
        
        const usez = config.add[4] !== 0 || config.between[4] !== 0;
        
        for (let i = 0; i < ballNumber; i++) {
            let posx = (sinus[tmpDeg[0]] * config.scale[0]) + (sinus[tmpDeg[1]] * config.scale[1]);
            let posy = (sinus[tmpDeg[2]] * config.scale[0]) + (sinus[tmpDeg[3]] * config.scale[1]);
            let posz = 0;
            
            // Z dimension is optional
            if (usez) {
                posz = sinus[tmpDeg[4]];

                const distanceX = 700;
                const distanceY = 500;
                posx = posx * ( distanceX / (posz + distanceX));
                posy = posy * ( distanceY / (posz + distanceY));
                posz = Math.round(posz * 50 + 80);
            } else {
                posz = 100;
            }

            positions.push([posx, posy, posz]);
            
            for (let i = 0; i < deg.length; ++i) {
                tmpDeg[i] += config.between[i];
                tmpDeg[i] &= sinLength-1;
            }
        }

        for (let i = 0; i < deg.length; ++i) {
            deg[i] += config.add[i];
            deg[i] &= sinLength-1;
        }

        return positions;
    }

    function processBalls(positions) {
        let nr = 0;
        const areaHeight = height - ballSize;
        
        for (const ball of balls) {
            const pos = positions[nr];
            
            let posx = pos[0];
            let posy = pos[1];
            let posz = pos[2];
            
            posx = posx * ((width/3) - ballSize) + (width/2) - (ballSize/2);
            posy = posy * (areaHeight/3) + (areaHeight/2);
            
            ball.x = posx;
            ball.y = posy;
            ball.z = posz;
            ball.size = posz;
            
            ++nr;
        }
    }
    
    function animate() {
        return new Promise((resolve) => {
            currPositions = calcBalls(currDeg, currConfig);
            if (transformStep > 0) {
                if (!processTransform()) {
                    transformStep = 0;
                    next();
                }
                processBalls(nextPositions);
            } else {
                processBalls(currPositions);
            }
            
            resolve();
        });
    }
    
    return {
        animate,
        setScreenSize,
        initTransform,
        processTransform
    };
};

const TextScroller = function(playfield, text) {
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


const Chessboard = function(playfield) {
    const size = 200;
    let move = 0;
    const speed = 4;
    
    let elements = [];

    let width = playfield.clientWidth;
    let height = playfield.clientHeight;
    
    create();
    
    function setScreenSize(w, h) {
        width = w;
        height = h;
    }
    
    function remove() {
        elements = [];
    }
    
    function create() {
        const lines = Math.ceil(height / size) * 4;

        // set chessboard height (before rotation)
        playfield.style.height = `${lines * size}px`;
        
        for (let y = 0; y < lines; y++) {
            const even = y%2;
            for (let x = even == 0 ? 0 : 1; x < (width / size) + 2; x++) {
                if ((x-even)%2 == 0) {
                    const field = new Field();
                    field.size = size;
                    field.x = x * size;
                    field.y = y * size;
                    playfield.appendChild(field.element);
                    elements.push(field);
                }
            }
        }
    }

    function process() {
        let x = 0;
        let y = 0;
        
        for (const element of elements) {
            element.x = x * size + move;
            element.y = y * size;
            x += 2;
            if (x >= (width / size) + 2)
            {
                ++y;
                x = y%2;
            }
        }

        move += speed;
        if (move > size*2) {
            move = 0;
        }
            
        
    }
    
    function animate() {
        return new Promise((resolve) => {
            process();
            resolve();
        });
    }

    return {
        animate,
        remove,
        create,
        setScreenSize,
    };
};


const startDemo = function() {
    const TIMEOUT_NEXT_OBJECT = 1000 * 30;
    const playfield = document.querySelector('.playfield');
    const balls = new SinusBalls3d(playfield);
    const scroller = new TextScroller(playfield, text);
    const chessboard = new Chessboard(document.querySelector('div.chessboard > div'));

    function transform() {
        balls.initTransform();
        setTimeout(transform, TIMEOUT_NEXT_OBJECT);
    }
    
    playfield.addEventListener('click', function() {
        balls.initTransform();
    });
    
    window.addEventListener('resize', function() {
        const w = playfield.clientWidth;
        const h = playfield.clientHeight;

        const domLetters = document.querySelectorAll('.letter');
        for (const letter of domLetters) {
            letter.parentNode.removeChild(letter);
        }

        const domChessfield = document.querySelectorAll('.chessfield');
        for (const el of domChessfield) {
            el.parentNode.removeChild(el);
        }
        
        balls.setScreenSize(w, h);
        
        scroller.setScreenSize(w, h);
        scroller.removeLetters();
        scroller.createLetters();

        chessboard.setScreenSize(w, h);
        chessboard.remove();
        chessboard.create();
    });

    async function animate() {
        //const s = Date.now();
        
        let first = balls.animate();
        //await first;
        let second = scroller.animate();
        //await second;

        let third = chessboard.animate();
        
        await Promise.all([first, second, third]);

        //console.log(Date.now() - s);
        
        requestAnimationFrame(animate);
    }

    setTimeout(transform, TIMEOUT_NEXT_OBJECT);

    requestAnimationFrame(animate);
};

const loadAndPlayMusic = function() {
    initMusic();
    const music = Uint8Array.from(atob(amegas), c => c.charCodeAt(0)).buffer;
    const player = window.neoart.Trackers.Soundtracker();
    player.load(music);
    player.loop = 1;
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
      + "\x01This demo was made in November and December 2022."
      + "      "
      + "Press left mouse button for different ball movements or wait a moment for automatic sinus *transformation*."
      + "      "
      + "\x00If you don't know Amiga classic demo style let me explain that what you see is just sinus balls with a little 3d perspective and DYCP scroll text."
      + " DYCP stands for different Y charset position."
      + "      "
      + "I find that this demo works faster on Firefox than Chromium. It is made without using Canva object, everything is made using DIV elements..."
      + "      "
      + "\x02Music comes from amiga's *His Master's Noise* music disk."
      + "      "
      + "\x01Greetings go to all the demo fans :) Merry Christmas and Happy New Year 2023 !"
      + "      "
      + "\x00     ... let's wrap the text...";
