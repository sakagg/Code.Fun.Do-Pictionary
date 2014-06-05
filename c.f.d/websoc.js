
var sx1 = 100;
var sy1 = 100;

function updateother(x, y)
{
    con.lineWidth = radius*2
    con.lineCap = "round"
    con.moveTo(sx1, sy1)
    con.lineTo(x, y)
    //con.closePath()
    con.stroke()
    sx1 = x
    sy1 = y
}

try {
    
    var host = "ws://localhost:9110/";
    console.log("Host:", host);
	
	s = new WebSocket(host);
	
	s.onopen = function (e) {
		console.log("Socket opened.");
	};
	
	s.onclose = function (e) {
		console.log("Socket closed.");
	};
        
        s.onmessage = function(e) {
            console.log("Data Recieved: ", e.data);
            coords = e.data.split(',');
            updateother(parseInt(coords[0]), parseInt(coords[1]));
        };
        
        s.onerror = function (e) {
        console.log("Socket error:", e);
	};
}
catch(e) {
    console.log("Socket exception:", e);
}