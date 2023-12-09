const WebSocket = require('ws');
const http = require('http');

const clients = new Map();

function parseCookies(cookieHeader) {
	  const cookies = {};
	  if (cookieHeader) {
		      const cookieStrings = cookieHeader.split(';');
		      for (const cookieString of cookieStrings) {
			            const [name, value] = cookieString.trim().split('=');
			            cookies[name] = decodeURIComponent(value);
			          }
		    }
	  return cookies;
}

const server = http.createServer((req, res) => {
	  console.log(clients)
	    const cookies = parseCookies(req.headers.cookie)
	    console.log(cookies)
	    if(cookies.access){
		          console.log("access granted")
		          const wss = new WebSocket.Server({ server });
		          wss.on('connection', (ws) => {
				          console.log('Client connected');
						  const {createConnection} = require('mysql2');
						  const con = createConnection({
							host: 'localhost',
							user: 'root',
							password: 'l',
							database: 'messaging_app',
						})
				          let senderid;
				          ws.on('message', async (message) => {
						            console.log(`Received message: ${message}`);

						            let {sender,receiver} = JSON.parse(message);
						            senderid = sender;
						            clients.set(sender,ws);
									for(let [key, value] of clients){
										value.send(JSON.stringify({type:"online",data:Array.from(clients.keys())}))
									}
									
						            const query = `
							                  SELECT *
									                FROM Conversation
											              WHERE (Sender = ? AND Receiver = ?) OR (Sender = ? AND Receiver = ?)
												                    ORDER BY CId
														              `;
									const result = await con.promise().execute(query,[sender,receiver,receiver,sender]).then((res)=>{return res[0]});								  		
						            ws.send(JSON.stringify(result));
						            console.log("SENT MESSAGE TO SENDER")
						            console.log(clients.has(receiver));
						            if (clients.get(receiver)){
								                let wsss = clients.get(receiver);
								                console.log(wsss);
								                wsss.send(JSON.stringify(result));
								                console.log("SENT MESSAGE TO RECEIVER")
								              }
						            console.log(clients.keys())}
						          );

				         ws.on('close', () => {
								 con.end();
						         console.log('Client disconnected');
						         clients.delete(senderid);
						         });
				      });
		        res.writeHead(200, { 'Content-Type': 'text/plain' });
		        res.end('HTTP server works!\n');
		      }else{
			          res.writeHead(403, { 'Content-Type': 'text/plain' });
			          res.end('Access denied\n');
			        }
});
setInterval(()=>{console.log(clients.keys())},1000);
server.listen(9000);

// const server = new WebSocket.Server({ port: 9000 });
//
//
// // });
//
