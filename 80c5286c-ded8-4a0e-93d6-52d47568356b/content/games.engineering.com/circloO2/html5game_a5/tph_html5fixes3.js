//Source: http://stackoverflow.com/questions/8603656/html5-canvas-arcs-not-rendering-correctly-in-google-chrome
var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
if (is_chrome && false) {
    CanvasRenderingContext2D.prototype.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
    // Signed length of curve
    var signedLength;
    var tau = 2 * Math.PI;

    if (!anticlockwise && (endAngle - startAngle) >= tau) {
        signedLength = tau;
    } else if (anticlockwise && (startAngle - endAngle) >= tau) {
        signedLength = -tau;
    } else {
        var delta = endAngle - startAngle;
        signedLength = delta - tau * Math.floor(delta / tau);

        // If very close to a full number of revolutions, make it full
        if (Math.abs(delta) > 1e-12 && signedLength < 1e-12)
        signedLength = tau;

        // Adjust if anti-clockwise
        if (anticlockwise && signedLength > 0)
        signedLength = signedLength - tau;
    }

    // Minimum number of curves; 1 per quadrant.
    var minCurves = Math.ceil(Math.abs(signedLength)/(Math.PI/2));

    // Number of curves; square-root of radius (or minimum)
    var numCurves = Math.ceil(Math.max(minCurves, Math.sqrt(radius)));

    // "Radius" of control points to ensure that the middle point
    // of the curve is exactly on the circle radius.
    var cpRadius = radius * (2 - Math.cos(signedLength / (numCurves * 2)));

    // Angle step per curve
    var step = signedLength / numCurves;

    // Draw the circle
    this.lineTo(x + radius * Math.cos(startAngle), y + radius * Math.sin(startAngle));
    for (var i = 0, a = startAngle + step, a2 = startAngle + step/2; i < numCurves; ++i, a += step, a2 += step)
        this.quadraticCurveTo(x + cpRadius * Math.cos(a2), y + cpRadius * Math.sin(a2), x + radius * Math.cos(a), y + radius * Math.sin(a));
    }

    console.log("drawARC");
}

var context_2;
function beginPath(ctx, linewidth)
{
	ctx.beginPath();
	ctx.lineWidth = linewidth;
	context_2 = ctx;
}

function pathMoveTo(x1, y1)
{
    context_2.moveTo(x1, y1);
}

function pathLineTo(x1, y1)
{
	context_2.lineTo(x1, y1);
}

function pathCircle(x, y, radius)
{
	context_2.moveTo(x, y);
	context_2.arc(x, y, radius, 0, 2*Math.PI);
}

function drawPathArc(x, y, radius, sAngle, eAngle) {
    sAngle = 360 - sAngle;
    eAngle = 360 - eAngle;
    context_2.arc(x, y, radius, sAngle / 180 * Math.PI, eAngle / 180 * Math.PI, true);
}

function pathStroke(name)
{
	context_2.stroke();
}

function pathFill()
{
	context_2.fill();
}

//Avoid the popup blocker
var urlOpenFunction;
function addLinkHandler(url)
{
	urlOpenFunction = function(e)
	{
		var keyCode = e.keyCode;
		if ((keyCode == 13) || (keyCode == 32))
		{
			window.open(url, "_blank", "width=1000, height=500, location=yes, resizable=yes, scrollbars=yes, toolbar=yes");
			document.getElementById("canvas").focus();
		}
	};
	document.addEventListener("keydown", urlOpenFunction);
}

function removeLinkHandler()
{
	document.removeEventListener("keydown", urlOpenFunction);
}

//Avoid keydown problems
var keys = {};
window.addEventListener("keydown",
function(e){
keys[e.keyCode] = true;
switch(e.keyCode){
case 37: case 39: case 38: case 40: // Arrow keys
case 32: e.preventDefault(); break; // Space
default: break; // do not block other keys
}
},
false);
window.addEventListener("keyup",
function(e){
keys[e.keyCode] = false;
},
false);

function addAnimationPolyfill()
{
	window.requestAnimFrame = (function(){
  return  function( callback ){
            window.setTimeout(callback, 16);
          };
})();
}

function isEdge()
{
    return window.navigator.userAgent.indexOf("Edge") > -1;
}

var failedOrientationLock = false;

// Try to lock the device orientation to the right orientation
function tryLockOrientation() {
    if ("orientation" in screen) {
        if ("lock" in screen.orientation)
            screen.orientation.lock("landscape").catch(function() {
                failedOrientationLock = true;
            });
        else if ("lockOrientation" in screen.orientation)
            screen.orientation.lockOrientation("landscape");
        else if ("mozLockOrientation" in screen.orientation)
            screen.orientation.mozLockOrientation("landscape");
    } else if ("mozOrientation" in screen) {
        if ("mozLock" in screen.mozOrientation)
            screen.orientation.mozLock("landscape").catch(function() {
                failedOrientationLock = true;
            });
        else if ("mozLockOrientation" in screen.mozOrientation)
            screen.orientation.mozLockOrientation("landscape");
    } else if ("msOrientation" in screen) {
        if ("msLock" in screen.msOrientation)
            screen.orientation.msLock("landscape").catch(function() {
                failedOrientationLock = true;
            });
        else if ("msLockOrientation" in screen.msOrientation)
            screen.orientation.msLockOrientation("landscape");
    } else if ("webkitOrientation" in screen) {
        if ("webkitLock" in screen.webkitOrientation)
            screen.orientation.webkitLock("landscape").catch(function() {
                failedOrientationLock = true;
            });
        else if ("webkitLockOrientation" in screen.webkitOrientation)
            screen.orientation.webkitLockOrientation("landscape");
    }
}

function toggleHTML5Fullscreen()
{
    if (! isHTML5FullScreen()) {
        try {
            var thePromiseHopefully;

            if (document.documentElement.requestFullscreen) {  
                thePromiseHopefully = document.documentElement.requestFullscreen();  
            } else if (document.documentElement.mozRequestFullScreen) {
                thePromiseHopefully = document.documentElement.mozRequestFullScreen();  
            } else if (document.documentElement.webkitRequestFullScreen) {
                thePromiseHopefully = document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
            } else if (document.documentElement.msRequestFullscreen) {
                thePromiseHopefully = document.documentElement.msRequestFullscreen();  
            }   

            //If the stars are right, .
            if (thePromiseHopefully != undefined)
                thePromiseHopefully.catch(function() {
                    //No catch
                }).then(function() {
                    if (failedOrientationLock)
                        tryLockOrientation();
                });

            tryLockOrientation();
        } catch (err) {

        }
    } else {  
        if (document.cancelFullscreen) {  
            document.cancelFullscreen();  
        } else if (document.mozCancelFullScreen) {  
            document.mozCancelFullScreen();  
        } else if (document.webkitCancelFullScreen) {  
            document.webkitCancelFullScreen();  
        } else if (document.msCancelFullscreen) {  
            document.msCancelFullscreen();  
        }
    } 

    //Firefox bug
    setTimeout(function()
    {
        document.documentElement.style.backgroundColor = "#101010";
        document.body.style.backgroundColor = "#101010";

        setTimeout(function()
        {
            document.documentElement.style.backgroundColor = "black";
            document.body.style.backgroundColor = "black";
        }, 100);
    }, 1000);
}

function isHTML5FullScreen()
{
    return (document.fullScreenElement && document.fullScreenElement !== null) || (document.mozFullScreenElement && document.mozFullScreenElement !== null) || (document.msFullscreenElement && document.msFullscreenElement !== null) || (document.webkitFullscreenElement && document.webkitFullscreenElement !== null);
}

function getDevicePixelRatio() {
    return window.devicePixelRatio;
}

function setCanvasCSSSize(width, height) {
    var cnv = document.getElementById("canvas");
    cnv.style.width = width + "px";
    cnv.style.height = height + "px";
}

function addTouchscreenHandlerCanvas() {
    document.getElementById("canvas").addEventListener("touchend", function() {
        if (! isHTML5FullScreen())
            toggleHTML5Fullscreen();
    });
}

if(typeof AudioContext != "undefined" || typeof webkitAudioContext != "undefined") {
   var resumeAudio = function() {
      if(typeof g_WebAudioContext == "undefined" || g_WebAudioContext == null) return;
      if(g_WebAudioContext.state == "suspended") g_WebAudioContext.resume();
   };
   document.getElementById("canvas").addEventListener("click", resumeAudio);
   document.getElementById("canvas").addEventListener("touchend", resumeAudio);
   document.getElementById("canvas").style.display = "block";
}

var clickRegisteredSinceLastFrame = false, clickRegisteredOnThisFrame = false;

function registerClick() {
    clickRegisteredSinceLastFrame = true;
}

document.getElementById("canvas").addEventListener("mousedown", registerClick);

//document.getElementById("canvas").addEventListener("keyup")

function mouse_check_pressed_left_notbroken() {
    return clickRegisteredOnThisFrame ? 1 : 0;
}

function mouse_handle_beginstep() {
    clickRegisteredOnThisFrame = clickRegisteredSinceLastFrame;
    clickRegisteredSinceLastFrame = false;
}

function browser_scroll_zero() {
    window.scrollTo(0, 0);

    window.setTimeout(function() {
        window.scrollTo(0, 0);
    }, 500);
}

function gmEval(code) {
    eval(code);
}

htmlFixedLoaded = true;


/// https://yal.cc/gamemaker-html5-loading-bar-extended/
var inst = { };
///~
var loadBarImage = null, canUseLoadBarImage = false, setLoadBarSource = false;
try {
var loadBarImage = new Image();
loadBarImage.onload = () => {
    canUseLoadBarImage = true;
};
} catch (e) {

}

function customized_loadbar(ctx, width, height, total, current, image) {

    image = loadBarImage;
    
    function getv(s) {
        if (window.gml_Script_gmcallback_normal_loadbar) {
            return window.gml_Script_gmcallback_normal_loadbar(inst, null,
                s, current, total,
                width, height, image ? image.width : 0, image ? image.height : 0)
        } else return undefined;
    }
    function getf(s, d) {
        var r = getv(s);
        return typeof(r) == "number" ? r : d;
    }
    function getw(s, d) {
        var r = getv(s);
        return r && r.constructor == Array ? r : d;
    }
    function getc(s, d) {
        var r = getv(s);
        if (typeof(r) == "number") {
            r = r.toString(16);
            while (r.length < 6) r = "0" + r;
            return "#" + r;
        } else if (typeof(r) == "string") {
            return r;
        } else return d;
    }

    //Set image of load bar
    if (! setLoadBarSource) {
        loadBarImage.src = getv("loadingImageUrl");
        setLoadBarSource = true;
    }

    // get parameters:
    width = getf("width", width);
    height = getf("height", height);
    var csswidth = getf("csswidth", width);
    var cssheight = getf("cssheight", height);

    //Resize the canvas
    var cnv = document.getElementById("loading_screen");
    if (cnv != null) {
        cnv.style.width = csswidth + "px";
        cnv.style.height = cssheight + "px";

        cnv.width = width;
        cnv.height = height;

        cnv.style.display = "block";
        cnv.style.position = "fixed";
    }
    
    var backgroundColor = getc("background_color", "#FFFFFF");
    var barBackgroundColor = getc("bar_background_color", "#FFFFFF");
    var barForegroundColor = getc("bar_foreground_color", "#242238");
    var barBorderColor = getc("bar_border_color", "#242238");
    var barWidth = getf("bar_width", Math.round(width * 0.8));
    var barHeight = getf("bar_height", 20);
    var barBorderWidth = getf("bar_border_width", 2);
    var barOffset = getf("bar_offset", 10);
    // background:
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    // image:
    var totalHeight, barTop;
    if (image != null && canUseLoadBarImage) {
        var wrh = 1920 / 1080;
        var newWidth = width;
        var newHeight = newWidth / wrh;
        if (newHeight < height) {
            newHeight = height;
            newWidth = newHeight * wrh;
        }

        ctx.drawImage(image, (width - newWidth) / 2, (height - newHeight) / 2, newWidth, newHeight);
    }
    var barTop = Math.max(height - Math.round(width * 0.1) - barHeight, (height - barHeight) >> 1);
    // bar border:
    var barLeft = (width - barWidth) >> 1;
    ctx.fillStyle = barBorderColor;
    ctx.fillRect(barLeft, barTop, barWidth, barHeight);
    //
    var barInnerLeft = barLeft + barBorderWidth;
    var barInnerTop = barTop + barBorderWidth;
    var barInnerWidth = barWidth - barBorderWidth * 2;
    var barInnerHeight = barHeight - barBorderWidth * 2;
    // bar background:
    ctx.fillStyle = barBackgroundColor;
    ctx.fillRect(barInnerLeft, barInnerTop, barInnerWidth, barInnerHeight);
    // bar foreground:
    var barLoadedWidth = Math.round(barInnerWidth * current / total);
    ctx.fillStyle = barForegroundColor;
    ctx.fillRect(barInnerLeft, barInnerTop, barLoadedWidth, barInnerHeight);
}