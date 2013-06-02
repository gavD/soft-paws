var Game = (function() {
    
    // I have a div called "page"
    var page = document.getElementById('page');
    var soundPtr = 0;
    var SOUND_COUNT = 8;
    var soundPlayers = [];
    
    function addSoundToPage(sfx) {
        var audio = document.createElement('video');
        trace("Adding " + audio + " to page with sfx " + sfx);
        audio.src = sfx;
        page.appendChild(audio);
        soundPlayers.push(audio);
    }
    
    for(var i = 0; i < SOUND_COUNT; i++) {
        var sound = "sfx/sound-" + (i + 1) + ".wav"
        if(typeof(forge) != 'undefined') {
            forge.tools.getURL(sound, function(sfx) { 
                addSoundToPage(sfx);
            });
        } else {
            addSoundToPage(sound);
        }
    }
    
    function playNextSound() {
        trace("Using sound player " + soundPlayers[soundPtr] + " at ptr " + soundPtr + " with sound " + soundPlayers[soundPtr].src);
        soundPlayers[soundPtr].play();
        if(++soundPtr > (soundPlayers.length-1)) {
            soundPtr = 0;
        }
    }

 
    // old Flash habits die hard
    function trace(o) {
        if(typeof(forge) != 'undefined') {
            forge.logging.log(o);
        } else {
            console.log(o);
        }
    }

    function Vector(xPxPerFrame, yPxPerFrame, frames) {
        this.xPxPerFrame = xPxPerFrame;
        this.yPxPerFrame = yPxPerFrame;
        this.frames = frames;
    }

    // // adapted from my ActionScript 3.0 Bullet Curtain engine
    // see https://github.com/gavD/Battle-Platform-Danmaku
    var ballistics = {

        aimAtPoint:function (fromX, fromY, toX, toY, speed) {
            var radians = this.getAngle(fromX, fromY, toX, toY);			
            var vector = this.aimAtRadians(radians, fromX, fromY, toX, toY, speed);
            return vector;
        },

        getAngle: function(fromX, fromY, toX, toY) {
            return Math.atan2(toY - fromY, toX - fromX);
        },

        aimAtRadians: function (radians, fromX, fromY, toX, toY, speed) {

            var xTravel = speed * Math.cos(radians);
            var yTravel = speed * Math.sin(radians);

            // number of ticks at current speed to cover hypotenuse
            var hyp = Math.sqrt(
                            Math.abs((fromX - toX)*(fromX - toX))
                            + Math.abs((fromY - toY)*(fromY - toY))
            );

            var frames = Math.abs(hyp / speed);
            var vector = new Vector(xTravel, yTravel, frames);
            return vector;
        }
    }
    
    function rand(n) {
        return Math.floor(Math.random() * n);
    }
    
    var frameRateMs = 10;
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    var smallestAspect = (w > h) ? h : w;
    var tapRadius = smallestAspect * 0.14; // 
    
    // initialise
    ctx.lineWidth=4;
    ctx.strokeStyle = "#CC0000";
    
    function Spot(x, y) {
        
        function getRandomFillStyle() {
            function randColour() {
                return rand(200) + 55;
            }
            
            return "rgb(" + randColour() + ", " + randColour() + ", " + randColour() + ")";
        }
        trace(getRandomFillStyle());
        var fillStyle = getRandomFillStyle();
        var travel = new Vector(1, 0, 5);
        var minSpeedPx = 6;
        var speedRangePx = 4;
        var screenBorderPx = 3;
        
        // TODO refactor to timer
        var ticksToChange = 0;
        var ticksRange = 400;
        var minTicks = 100; 
        
        // set the radius of the circle to be 3% of whatever smaller aspect is
        var size = smallestAspect * 0.04;
            
        var wiggleWhenNotRunning = 4;
        
        this.getX = function() {
            return x;
        }
        
        this.getY = function() {
            return y;
        }
                
        this.update = function() {
            
            if(travel.frames > 0) {
                --travel.frames;
                x += travel.xPxPerFrame;
                y += travel.yPxPerFrame;
            } else {
                
                // wiggle
                x += (wiggleWhenNotRunning/2) - (Math.random() * wiggleWhenNotRunning);
                y += (wiggleWhenNotRunning/2) - (Math.random() * wiggleWhenNotRunning);
            }
            
            if(--ticksToChange < 0) {
                ticksToChange = Math.floor((Math.random() * ticksRange) + minTicks);
                var toX = screenBorderPx + Math.floor(Math.random() * (w - screenBorderPx - screenBorderPx));
                var toY = screenBorderPx + Math.floor(Math.random() * (h - screenBorderPx - screenBorderPx));
                
                ctx.fillStyle = "rgb(180, 180, 180)";
                ctx.beginPath();
                ctx.arc(toX, toY, size/2, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.fill();
                
                var speed = minSpeedPx + Math.floor(Math.random() * speedRangePx);
                travel = ballistics.aimAtPoint(x, y, toX, toY, speed);
            }
        }
        
        this.draw = function() {
            
            ctx.fillStyle = fillStyle;
			ctx.beginPath();
            ctx.arc(x, y, size/2, 0, Math.PI * 2, false);
			ctx.closePath();
			ctx.fill();
        }
    }
    
    var spots = [new Spot(w/2, h/2)];
    
    function gameLoop() {
        var i = 0;
        
        for (i = 0; i < spots.length; i++) {
            spots[i].update();
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (i = 0; i < spots.length; i++) {
            spots[i].draw();
        }
    }

    function spawnSpot(x, y) {
        var s = new Spot(x,y);
        spots.push(s);

        playNextSound();
    }

    // TODO factor out reliance on jQuery 
    $("#game").hammer({
            prevent_default: false,
            drag_vertical: false
        })
        .bind("tap", function(ev) {
            var pos = ev.position[0];
            var doPush = false;
            
            for (i = 0; i < spots.length; i++) {
                var spot = spots[i];
                
                var distFromX = Math.abs(spot.getX() - pos.x);
                var distFromY = Math.abs(spot.getY() - pos.y);
                
                if(distFromX < tapRadius && distFromY < tapRadius) {
                    doPush = true;
                    break;
                }
            }
            
            if(doPush) {
                spawnSpot(pos.x, pos.y);
            }
        }
    );
        
    setInterval(gameLoop, frameRateMs);
});

Game();
