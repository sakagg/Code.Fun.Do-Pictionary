#!/usr/bin/env python

import socket, struct, hashlib, threading, cgi, base64

lock = threading.Lock()

def decode_key (key):
	guid = ""
	guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
	newkey = key + guid
	sha = hashlib.sha1(newkey)
	return base64.b64encode(sha.digest())

def recv_data (client, length):
	data = client.recv(length)
	if not data: return data
#	print "Data Received: ", data
	begin = 2
	message = data[begin+4:len(data)]
	code = data[begin:begin+4]
	parsed_message = ""
	for i in range(0, len(message)):
		parsed_message += chr(ord(message[i])^ord(code[i%4]))
	return parsed_message

def send_data (client, data):
#	print "Sending Data"
	string = chr(129)
	string += chr(len(data))
	string += data
	print "Sending %s to %s" % (data, client)
	return client.send(string)

def parse_headers (data):
	headers = {}
	lines = data.splitlines()
#	print "Headers as they are supposed to be:"
	for l in lines:
#		print l
		parts = l.split(": ", 1)
		if len(parts) == 2:
			headers[parts[0]] = parts[1]
	return headers

def handshake (client):
#	print 'Handshaking...'
	data = client.recv(1024)
	headers = parse_headers(data)
#	print 'Parsed headers:'
#	for k, v in headers.iteritems():
#		print k, ':', v
	shake = ""
	shake += "HTTP/1.1 101 Switching Protocols\r\n"
 	shake += "Upgrade: websocket\r\n" 
	shake += "Connection: Upgrade\r\n"
	shake += "Sec-WebSocket-Accept: %s\r\n" % decode_key(headers['Sec-WebSocket-Key'])
	shake += "\r\n"
#	print "Response Headers:"
#	print shake
	client.send(shake)

def handle (client, addr):
	handshake(client)
	clients.append(client)
	while 1:
		data = recv_data(client, 1024)
		if not data: break
		print "Data processed: ", data

		if data[0]=="-":									#New User Added
			name = data[1:len(data)]						
			for c in clients:
				send_data(c, "0"+name)						#Name of New User

		if data[0]=="0":									#Round Over
			curpos = (curpos+1)%len(clients)
			word = words[math.floor(random.random()*len(words))]
			send_data(clients[curpos], "1"+word)			#Round Start, Draw Word
			for c in clients:
				if c!= clients[curpos]:
					send_data(c, "2"+word)					#Round Start, Guess The Word

		elif data[0]=="1":									#Guessed a Word
			msg = data[1:len(data)]
			if msg == word:									#Correct Guess
				found = clients.index(client)
				for i in clients:
					send_data(i, "3"+found)					#Word successfully Guessed + Guesser
			else:											#Incorrect Guess
				for i in clients:							#Treat as message
					send_data(i, "4"+msg)

		elif data[0]=="2":									#Canvas Data
			can_data = "5"+data[1:len(data)]
			for c in clients:
				if c!=client:
					send_data(c, data)

	print 'Client closed:', addr
#	lock.acquire()
	clients.remove(client)
#	lock.release()
	client.close()
	
def start_server ():
	s = socket.socket()
	s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
	s.bind(('', 9110))
	s.listen(1)
	while True:
		conn, addr = s.accept()
		print 'Connection from: ', addr
		threading.Thread(target = handle, args = (conn, addr)).start()

clients = []
curpos = 0
print "Starting Server..."
try:
	start_server()
except KeyboardInterrupt:
	pass