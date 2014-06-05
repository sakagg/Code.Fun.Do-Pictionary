
var sx1 = 100;
var sy1 = 100;
var ismychance;

function updateother(x, y)
{
	con.lineWidth = radius * 2
    con.lineCap = "round"
	con.strokeStyle = color
    con.moveTo(sx1, sy1)
    con.lineTo(x, y)
    //con.closePath()
    con.stroke()
    sx1 = x
    sy1 = y
}

try {
    
    var host = "ws://10.3.5.26:9110/";
    console.log("Host:", host);
	
	s = new WebSocket(host);
	
	s.onopen = function (e) {
		console.log("Socket opened.");
	};
	
	s.onclose = function (e) {
		console.log("Socket closed.");
	};
        
	s.onmessage = function (e) {
			console.log("Data Recieved: ", e.data);
			var d = e.data
			if(d[0] == "0")
			{
				addPlayer(d.slice(1, d.lenght))
			}
			else if(d[0]=="1")
			{
				d = d.slice(1, d.length);
				d = d.split(';');
				for (var i = d.length - 1; i >= 0; i--) {
					addPlayer(d[i]);
				}
			}
			else if (d[0] == "2")
			{
				//killpreviousround();
				ismychance = 1;
				startround(d.slice(1, d.length));
			}
			else if(d[0]=="3")
			{
				//killpreviousround();
				setspecialcss(d.slice(1, d.length));
				startround(d.slice(1, d.length));
			}
			else if(d[0]=="4")
			{
				guessedcorrectly(d.slice(1, d.length));
			}
			else if(d[0]=="5")
			{
				addChatString(d.slice(1, d.length));
			}
			else if(d[0]=="6")
			{
				d = d.slice(1, d.length);
				if (d == "begin")
					con.beginPath();
				else if (d == "close")
					con.closePath();
				if (d[0] == "c") {
					color = d.slice(1, d.length);
					for (var i = 0; i < radiusElements.length; i++) {
						radiusElements[i].style.backgroundColor = color
						//console.log(radiusElements[i].id)
					}
				}
				else if (d[0] == "s")
					radius = parseInt(d.slice(1, d.length));
				else if (d[0] == "n") {
					coords = d.slice(1, d.length);
					coords = coords.split(',');
					sx1 = parseFloat(coords[0]) * canvas.width;
					sy1 = parseFloat(coords[1]) * canvas.height;
				}
				else {
					coords = d.split(',');
					console.log(parseFloat(coords[0]) * canvas.width, parseFloat(coords[1]) * canvas.height);
					updateother(parseFloat(coords[0]) * canvas.width, parseFloat(coords[1]) * canvas.height);
				}
			}
        };
        
        s.onerror = function (e) {
        	console.log("Socket error:", e);
			/*var messageDialog = new Windows.UI.Popups.MessageDialog("Internet Not Connected");
            messageDialog.showAsync();*/
	};
}
catch(e) {
    console.log("Socket exception:", e);
}