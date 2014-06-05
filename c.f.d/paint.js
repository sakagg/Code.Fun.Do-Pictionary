var x = 650, y = 327
var dx = 1, dy = 1
var color = "Black"
var radius = 4
var imagedata = []
var rectdata = []
var s

function line(e){
	con.strokeStyle = color
	con.beginPath()
	canvas.addEventListener("mousemove", update)
	imagedata.push(con.getImageData(0, 0, canvas.width, canvas.height))
	e.preventDefault()
	x1 = e.clientX - 10
	y1 = e.clientY - 50
}

function remove(){
	canvas.removeEventListener("mousemove", update)
	con.closePath()
	window.removeEventListener("mouseup", remove)
}

function fresh(){
	con.clearRect(0, 0, canvas.width, canvas.height)
	imagedata = []
	drawcanvas()
}

function change(e){
	xnew = document.getElementById('xip').value
	ynew = document.getElementById('yip').value
	radiusnew = document.getElementById('rad').value
	colornew = document.getElementById('col').value
	obindex = colornew.indexOf('(')
	colornew = colornew.substring(0, obindex)
	if(xnew != '') {x = xnew%canvas.width}
	if(ynew != '') {y = ynew%canvas.height}
	if(radiusnew != '') {radius = radiusnew}
	if(colornew != '') {color = colornew}
	radtext = document.getElementById('radius')
	radtext.innerHTML=radius
	coltext = document.getElementById('color')
	coltext.innerHTML=color
	seecol = document.getElementById('selected')
	seecol.style.backgroundColor = color
	showcolor = document.getElementById('showcl')
	showcolor.innerHTML = color
	for (i=0; i<colorlist.length; i++) {
		if (colorlist[i].color == color) {
			hex = colorlist[i].code
			break
		}
	}
	if (i==colorlist.length) {
		hex = color
	}
	showhex = document.getElementById('showhx')
	showhex.innerHTML = hex
	form1.reset()
	e.preventDefault()
}

function draw() {
	xtext = document.getElementById('x')
	xtext.innerHTML = Math.round(x)
	ytext = document.getElementById('y')
	ytext.innerHTML = Math.round(y)
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

function update(e) {
	x = e.clientX-10
	y = e.clientY-50
	//con.beginPath()
	con.strokeStyle = color
	con.lineWidth = radius*2
	con.lineCap = "round"
	con.moveTo(x1, y1)
	con.lineTo(x, y)
	//con.closePath()
	con.stroke()
	x1 = x
	y1 = y
	var tmpdata = x+","+y;
	s.send(tmpdata);
	console.log(tmpdata);
	//draw()
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

function main() {
	canvas = document.getElementById('draw')
	radtext = document.getElementById('radius')
	radtext.innerHTML=radius
	coltext = document.getElementById('color')
	coltext.innerHTML=color
	xtext = document.getElementById('x')
	xtext.innerHTML = x
	ytext = document.getElementById('y')
	ytext.innerHTML = y
	drawcanvas()
	canvas.addEventListener("mousedown", line)
	button = document.getElementById('refresh')
	button.addEventListener("click", fresh, false)
	undobut = document.getElementById('undobutton')
	undobut.addEventListener("click", undo, false)
	form1 = document.getElementById('form1')
	form1.addEventListener("submit", change)
	colpallete = document.getElementsByClassName('palcol')
	for (i=0; i<colpallete.length; i++) {
		divvar = document.getElementById(colpallete[i].id)
		divvar.style.backgroundColor = colpallete[i].id
		divvar.addEventListener("click", changecol)
	}
	function undo(e) {
		image = imagedata.pop()
		con.putImageData(image, 0, 0)
	}
	function changecol(e) {
		color=e.target.id
		coltext.innerHTML=color
		seecol = document.getElementById('selected')
		seecol.style.backgroundColor = color
		showcolor = document.getElementById('showcl')
		showcolor.innerHTML = color
		for (i=0; i<colorlist.length; i++) {
			if (colorlist[i].color == color) {
				hex = colorlist[i].code
				console.log(hex)
				break
			}
		}
		showhex = document.getElementById('showhx')
		showhex.innerHTML = hex
	}
	list = document.getElementsByTagName('option')
	function colorcodes(codecolor) {
		bracketin = codecolor.indexOf('(')
		colorname = codecolor.substring(0,bracketin)
		codename = codecolor.substring(bracketin+1, bracketin+8)
		return {color: colorname, code: codename}
	}
	colorlist = []
	for (i=0; i<list.length; i++) {
		newentry = colorcodes(list[i].value)
		colorlist.push(newentry)
	}	
}

window.addEventListener("load", main)