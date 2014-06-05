"use strict";

var x = 650, y = 327
var dx = 1, dy = 1
var color = "Red"
var radius = 4
var imagedata = []
var s
var canvas, con
var divvar, image, x1, y1
var outerdiv;
var leftOffset, topOffset
var radiusElements
var statsTable
var chatTextDiv, subButton, inpDiv
var indexPrev = 0, gamestart
var ismychance;
var mypath;

function line(e){
	con.strokeStyle = color
	s.send("2begin");
	con.beginPath()
	mypath = setInterval(datasender, 20);
	window.addEventListener("mousemove", update)
	imagedata.push(con.getImageData(0, 0, canvas.width, canvas.height))
	e.preventDefault()
	x1 = (e.clientX - leftOffset)
	y1 = (e.clientY - topOffset)
	s.send("2n" + x1/canvas.width + "," + y1/canvas.height);
}

function remove(){
	window.removeEventListener("mousemove", update)
	con.closePath()
	clearInterval(mypath);
	s.send("2close");
	window.removeEventListener("mouseup", remove)
}

function fresh(){
	con.clearRect(0, 0, canvas.width, canvas.height)
	imagedata = []
	drawcanvas()
}

function draw() {
	if(canvas.getContext) {
		con.lineWidth=2
		con = canvas.getContext('2d')
		con.strokeStyle = "black"
		con.strokeRect(0, 0, canvas.width, canvas.height)
		con.beginPath()
		con.fillStyle = color
		con.arc(x, y, radius, 0, 2*Math.PI)
		con.fill()
	}
}

function datasender(){
	var tmpdata = (x/canvas.width)+","+(y/canvas.height);
	s.send("2"+tmpdata);
		console.log(tmpdata)
}


function update(e) {
	x = (e.clientX - leftOffset)
	y = (e.clientY - topOffset)
	con.strokeStyle = color
	con.lineWidth = radius*2
	con.lineCap = "round"
	con.moveTo(x1, y1)
	con.lineTo(x, y)
	con.stroke()
	x1 = x
	y1 = y
	window.addEventListener("mouseup", remove, false)
}

function drawcanvas() {	
	if(canvas.getContext) {
		con = canvas.getContext('2d')
		con.strokeStyle = "black"
		con.lineWidth=2
		con.strokeRect(0, 0, canvas.width, canvas.height)
		con.strokeStyle = color
	}
}

function setspecialcss(index) {
	var playerlist = document.getElementsByClassName('playerrecord')
	playerlist[indexPrev].getElementsByTagName('td')[0].style.backgroundColor = 'yellow'
	playerlist[indexPrev].getElementsByTagName('td')[1].style.backgroundColor = 'yellow'
	playerlist[index].getElementsByTagName('td')[0].style.backgroundColor = 'pink'
	playerlist[index].getElementsByTagName('td')[1].style.backgroundColor = 'pink'
	indexPrev = index
}

function guessedcorrectly(indices) {
	var playerlist = document.getElementsByClassName('playerrecord')
	var scorerlist = indices.split(',')
	var prevScore1 = parseInt(playerlist[scorerlist[0]].getElementsByTagName('td')[1].innerHTML)
	var prevScore2 = parseInt(playerlist[scorerlist[1]].getElementsByTagName('td')[1].innerHTML)
	playerlist[scorerlist[0]].getElementsByTagName('td')[1].innerHTML = prevScore1 + 2
	playerlist[scorerlist[1]].getElementsByTagName('td')[1].innerHTML = prevScore2 + 3
	clearTimeout(gamestart)
	if (ismychance == 1) {
		s.send("0")
		ismychance = 0
	}
}

function addPlayer(string) {
	var namescorelist = string.split(',')
	statsTable = document.getElementById('stattable');
	statsTable.innerHTML += "<tr class=\"playerrecord\"><td class=\"normal\">" + namescorelist[0] + "</td><td class=\"normal\">" + namescorelist[1] + "</td></tr>"
}

function addChatString(str) {
	chatTextDiv.innerHTML += str + "<br />"
	chatTextDiv.scrollTop += chatTextDiv.scrollHeight;
}

function sendText() {
	var text = inpDiv.value
	inpDiv.value=""
//	addChatString(text)
	s.send("1"+text)
}

function startround(word) {
	fresh()
	con.font="30px Calibri";
	con.fillText(word, 50, 50)
	if (ismychance==1)
		canvas.addEventListener("mousedown", line)
	else if (ismychance == 0)
		canvas.removeEventListener("mousedown", line)
	gamestart = setTimeout(function () {
		if (ismychance == 1) {
			s.send("0")
			ismychance = 0
		}
	}, 60000)
}

function main() {
	var inpUname = document.getElementById('uname')
	inpUname.addEventListener("keyup", function (e) {
		if (e.keyCode == 13) {
			s.send("-" + inpUname.value)
			inpUname.value = ""
			inpUname.style.display = "none"
			var statId = document.getElementById('stats')
			statId.style.display = "inline-block"
		}
	})
	inpDiv = document.getElementById('ip')
	subButton = document.getElementById('subbut')
	subButton.addEventListener("click", sendText)
	inpDiv.addEventListener("keyup", function (e) {
		if (e.keyCode == 13) sendText();
	});
	chatTextDiv = document.getElementById('textarea')
	canvas = document.getElementById('draw')
	outerdiv = document.getElementById('canvascontainer');
	canvas.width = outerdiv.scrollWidth;
	canvas.height = outerdiv.scrollHeight;
	console.log(canvas.height, canvas.width);
	leftOffset = canvas.getBoundingClientRect().left
	topOffset = canvas.getBoundingClientRect().top;
	drawcanvas()
	var colpallete = document.getElementsByClassName('palcol')
	for (var i=0; i<colpallete.length; i++) {
		colpallete[i].addEventListener("click", changecol)
	}
	radiusElements = document.getElementsByClassName('palrad')
	for(var i=0; i<radiusElements.length; i++)
	{
		radiusElements[i].addEventListener("click", changerad)
	}
	function undo(e) {
		image = imagedata.pop()
		con.putImageData(image, 0, 0)
	}
	function changecol(e) {
		if (ismychance != 1)
			return;
		color = e.target.id
		s.send("2c" + color);
		for(var i=0; i<radiusElements.length; i++)
		{
			radiusElements[i].style.backgroundColor = color
			//console.log(radiusElements[i].id)
		}
	}
	function changerad(e) {
		if (ismychance != 1)
			return;
		if(e.target.id == "small")
			radius = 4
		else if(e.target.id == "medium")
			radius = 8
		else if(e.target.id == "large")
			radius = 16
		s.send("2s" + radius);
	}
}

window.addEventListener("load", main)