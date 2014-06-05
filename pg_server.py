#!/usr/bin/env python

import socket, struct, hashlib, threading, cgi, base64, math, random

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
	global it, new, curpos, word, clist
	handshake(client)
	while 1:
		data = recv_data(client, 100)
		if not data: break
		print "Data processed: ", data
		if data[0]=="-":								
			name = data[1:len(data)]
			clients[client] = [name, 0]
			clist.append(client)
			for c in clients:
				if c!=client:
					send_data(c, "0"+name+",0")				#Add New User
				else:
					players = ""
					for c in clients:
						if c!=client:
							players = players + clients[c][0] + "," + str(clients[c][1]) + ";"
					players = players + clients[client][0] + "," + str(clients[client][1]) + ";"
					send_data(client, "1"+players)			#Add Players List
					if len(clients)==1:
						word = words[int(math.floor(random.random()*len(words)))]
						send_data(client, "2"+word)			#Add Word to play with

		elif data[0]=="0":
			curpos = (curpos+1)%len(clist)
			new = clist[curpos]
			word = words[int(math.floor(random.random()*len(words)))]
			for c in clients:
				send_data(c, "3"+str(curpos))		#Add special css to artist in other clients
			send_data(new, "2"+word)				#Add Word to play with

		elif data[0]=="1": 			#Chat
			msg = data[1:len(data)]
			if msg == word:
				curpos = (curpos+1)%len(clist)
				new = clist[curpos]
				word = words[int(math.floor(random.random()*len(words)))]
				send_data(new, "2"+word)
				for c in clients:
					if c!= new:
						send_data(c, "3"+str(curpos))
				for c in clients:
					send_data(c, "4"+str(clients.keys().index(client))+","+str(curpos))

			else:
				for c in clients:
					send_data(c, "5"+clients[client][0]+": "+msg)

		elif data[0]=="2":		#Canvas
			data = data[1:len(data)]
			if data[1] == '0':
				data = data[0:15]
			elif data[1] == '.':
				data = data[0:14]

			for c in clients:
				if c!=client:
					send_data(c, "6"+data)

	print 'Client closed:', addr
#	lock.acquire()
#	clients.pop(client)
#	clist.pop(client)
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

clients = {}
clist = []
curpos = 0
words = ["Apple", "Ball", "Cat", "Mosquito", "Happiness", "Present", "Toy"]
new = ""
print "Starting Server..."
try:
	start_server()
except KeyboardInterrupt:
	pass