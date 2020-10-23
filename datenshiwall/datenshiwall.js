var eye1 = [], eye2 = [], speed = 1, interval;
var canvas = document.getElementById("canvas"), ctx = canvas.getContext('2d');
var mouseover = false, mousedown = false;
var settingsBg = document.getElementById("settings-background"), settingsWindow = settingsBg.childNodes[0];
var colorPickerBtn = document.getElementById("colorPicker"), imgInput = document.getElementById("imgInput");
var loadingBg = document.getElementById("loading-background"), loadingText = document.getElementById("loading-text"), progBar = document.getElementById("loading-progressbar");
var editMode = false, editModeWindow = document.getElementById("editMode-window"), widthBtn = document.getElementById("width-button"), heightBtn = document.getElementById("height-button");
var xPosBtn = document.getElementById("xposition-button"), yPosBtn = document.getElementById("yposition-button");
var imgModeRadBtns = document.imgModeSelector.imgMode, posRadBtns = document.positionSelector.position;

for (var i = 0; i < imgModeRadBtns.length; i++) {
    imgModeRadBtns[i].addEventListener('change', function() {
        localStorage.bgImgMode = this.value;
        changeBgImgMode(this.value);
    });
}
for (var i = 0; i < posRadBtns.length; i++) {
    posRadBtns[i].addEventListener('change', function() {
        changeDtsPos(this.value);
    });
}

document.onmouseout = function () {
    mousedown = false;
}
editModeWindow.onmouseover = function () {
    mousedown = false;
}
canvas.onmouseout = function () {
    mouseover = false;
}
canvas.onmousedown = function () {
    mousedown = true;
}
canvas.onmouseup = function () {
    mousedown = false;
}
canvas.onmousemove = function (event) {
    event.preventDefault();
    // get the position of clicked pixel
    var pos = findPos(this);
    var x = event.pageX - pos.x;
    var y = event.pageY - pos.y;
    // return array of [RED,GREEN,BLUE,ALPHA] as 0-255 of clicked pixel
    var pixel = ctx.getImageData(x, y, 1, 1).data;
    // if the alpha is not 0, we clicked a non-transparent pixel
    // could be easily adjusted to detect other features of the clicked pixel
    if (pixel[3] != 0){
        // do something when clicking on image...
        mouseover = true;
    } else {
        mouseover = false;
    }
    if (editMode && mousedown) {
        var deltaX = event.movementX;
        var deltaY = event.movementY;
        rect = canvas.getBoundingClientRect();
        canvas.style.left = rect.x + deltaX + 'px';
        canvas.style.top  = rect.y + deltaY + 'px';
        document.getElementById("position-center-radbtn").checked = true;
        xPosBtn.disabled = false;
        yPosBtn.disabled = false;
        updatePosBtns();
    }
}

if (localStorage.bgColor) {
    document.body.style.backgroundColor = localStorage.bgColor;
    colorPickerBtn.value = localStorage.bgColor;
}
if (localStorage.bgImg) document.body.style.backgroundImage = "url('data:image/png;base64," + localStorage.bgImg + "')";
changeBgImgMode(localStorage.bgImgMode ? localStorage.bgImgMode : "center");
if (localStorage.speed) {
    speed = parseFloat(localStorage.speed);
    document.getElementById("speed-button").textContent = '배속: ' + speed + 'x';
}
if (localStorage.dtsWidth) {
    canvas.width = localStorage.dtsWidth;
    widthBtn.textContent = canvas.width + 'px';
}
if (localStorage.dtsHeight) {
    canvas.height = localStorage.dtsHeight;
    heightBtn.textContent = canvas.height + 'px';
}
changeDtsPos(localStorage.dtsPosMode ? localStorage.dtsPosMode : "right", true);
if (localStorage.hideLoadWnd == "true") {
    loadingBg.style.display = "none";
    document.getElementById("HideLoadWndChkBox").checked = true;
}

loadingText.textContent = "이미지 로딩 중... (0/96)";
for (var i = 0; i < 48; i++) {
    eye1[i] = new Image();
    eye1[i].onload = function () {
        var src = eye1[i].src;
        updateProgess();
    }
    eye1[i].src = "eye1/frame" + (i + 1) + ".png";
}

for (var i = 0; i < 48; i++) {
    eye2[i] = new Image();
    eye2[i].onload = function () {
        var src = eye2[i].src;
        updateProgess();
    }
    eye2[i].src = "eye2/frame" + (i + 1) + ".png";
}

var i = 0;
startInterval();

function startInterval() {
    interval = setInterval(function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(mouseover ? eye2[i] : eye1[i], 0, 0, canvas.width, canvas.height);
        i++;
        if (i >= 48) i = 0;
    }, 42 / speed);
}

function loadBgImg() {
    var reader = new FileReader();
    reader.onload = function () {
        var b64str = reader.result.split(";base64,")[1];
        document.body.style.backgroundImage = "url('data:image/png;base64," + b64str + "')";
        localStorage.bgImg = b64str;
    };
    reader.readAsDataURL(imgInput.files[0]);
}

function updateProgess() {
    progBar.value++;
    loadingText.textContent = "이미지 로딩 중... (" + progBar.value + "/96)";
    if (progBar.value == 96) {
        fadeOut(loadingBg);
        fadeIn(canvas);
    }
}

function updatePosBtns() {
    rect = canvas.getBoundingClientRect();
    xPosBtn.textContent = rect.x + 'px';
    yPosBtn.textContent = rect.y + 'px';
}

function changeBgImgMode(value) {
    imgModeRadBtns.value = value;
    switch(value) {
        case "center":
            document.body.style.backgroundSize = "auto";
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundPosition = "center center";
        break;
        case "grid":
            document.body.style.backgroundSize = "auto";
            document.body.style.backgroundRepeat = "repeat";
            document.body.style.backgroundPosition = "left top";
        break;
        case "horizfit":
            document.body.style.backgroundSize = "contain";
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundPosition = "center center";
        break;
        case "vertfit":
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundPosition = "center center";
        break;
        case "scale":
            document.body.style.backgroundSize = "100% 100%";
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundPosition = "center center";
        break;
    }
}

function changeDtsPos(value, loadCustomPosFromPrefs) {
    posRadBtns.value = value;
    xPosBtn.disabled = value != "custom";
    yPosBtn.disabled = value != "custom";
    switch (value) {
        case "left":
            canvas.style.left = '30px';
            canvas.style.right = '';
            canvas.style.top = '';
        break;
        case "center":
            canvas.style.left = innerWidth / 2 - canvas.width / 2 + 'px';
            canvas.style.right = '';
            canvas.style.top = '';
        break;
        case "right":
            canvas.style.left = '';
            canvas.style.right = '30px';
            canvas.style.top = '';
        break;
        case "custom":
            if (loadCustomPosFromPrefs) {
                if (localStorage.dtsXPos) {
                    canvas.style.left = localStorage.dtsXPos;
                }
                if (localStorage.dtsYPos) {
                    canvas.style.top = localStorage.dtsYPos;
                }
            }
        break;
    }
    updatePosBtns();
}

function revertSizeAndPos() {
    canvas.width = localStorage.dtsWidth ? localStorage.dtsWidth : 392;
    widthBtn.textContent = canvas.width + 'px';
    canvas.height = localStorage.dtsHeight ? localStorage.dtsHeight : 450;
    heightBtn.textContent = canvas.height + 'px';
    changeDtsPos(localStorage.dtsPosMode ? localStorage.dtsPosMode : 'right', true);
}

function fadeIn(elem) {
    var i = 0.1;
    elem.style.opacity = i;
    elem.style.filter = "alpha(opacity=" + i * 100 + ")";
    elem.style.display = "block";
    var interval = setInterval(function () {
        if (i >= 1){
            clearInterval(interval);
        }
        elem.style.opacity = i;
        elem.style.filter = "alpha(opacity=" + i * 100 + ")";
        i += i * 0.1;
    }, 5);
    setTimeout(function() {
        clearInterval(interval);
        elem.style.opacity = 1;
        elem.style.filter = "alpha(opacity=" + 100 + ")";
    }, 500);
}

function fadeOut(elem) {
    var i = 1; 
    var interval = setInterval(function () {
        if (i <= 0.1){
            clearInterval(interval);
            elem.style.display = "none";
        }
        elem.style.opacity = i;
        elem.style.filter = "alpha(opacity=" + i * 100 + ")";
        i -= i * 0.1;
    }, 5);
    setTimeout(function() {
        clearInterval(interval);
        elem.style.display = "none";
    }, 500);
}

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function yannaiJannaiDekinainda() {
    var tmp = document.createElement("textarea");
    document.body.appendChild(tmp);
    tmp.value = "https://www.youtube.com/watch?v=ANp0qch3XVM";
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
}

function debug() {
    eval(prompt("실행할 자바스크립트 코드를 입력하십시오. (디버깅용)"));
    function loadEruda() {
        var script = document.createElement('script');
        script.src="https://cdn.jsdelivr.net/npm/eruda";
        document.body.appendChild(script);
        script.onload = function () {
            eruda.init();
        };
    }
}