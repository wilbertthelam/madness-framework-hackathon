const crypto = require('crypto');
const sharedSecret = "clV2Ellcprvgba+YL/b03oDi0P37p1TwB30I7ytZKD4="; // e.g. "+ZaRRMC8+mpnfGaGsBOmkIFt98bttL5YQRq3p2tXgcE="
const bufSecret = Buffer(sharedSecret, "base64");
const httpRequest = require('request');
const cheerio = require('cheerio')

const http = require('http');
const PORT = process.env.port || process.env.PORT || 8080;

http.createServer(function (request, response) { 
	let payload = '';
	// Process the request
	request.on('data', function(data) {
		payload = JSON.parse(data).text;

		payload = payload.toLowerCase().replace(/&nbsp;/gi,'').split('</at>')[1].trim();
	});
	
	// Respond to the request
	request.on('end', function () {
		// try {
		// 	// Retrieve authorization HMAC information
		// 	const auth = this.headers['authorization'];
		// 	// Calculate HMAC on the message we've received using the shared secret			
		// 	const msgBuf = Buffer.from(payload, 'utf8');
		// 	const msgHash = "HMAC " + crypto.createHmac('sha256', bufSecret).update(msgBuf).digest("base64");
		// 	// console.log("Computed HMAC: " + msgHash);
		// 	// console.log("Received HMAC: " + auth);
			
			let responseMsg;
			// if (msgHash === auth) {
				// const receivedMsg = JSON.parse(payload);

				httpRequest.get('http://fcast.us-west-2.espncdn.com/FastcastService/pubsub/profiles/12000/topic/event-topevents/message/5486582/checkpoint', function (error, res, body) {
					response.writeHead(200);	
					if (error) {
						return res.end("Error: " + error);
					}
					
					const games = JSON.parse(res.body).events;
					let message = '';
					games.forEach(function (game) {
						const team0 = game.competitions[0].competitors[0];
						const team1 = game.competitions[0].competitors[1];
						const teamName0 = team0.team.displayName;
						const teamName1 = team1.team.displayName;

						if (payload === '') {
							if ((!team1.hasOwnProperty('winner') && !team0.hasOwnProperty('winner'))) {
								message += '<br>Half: ' + game.status.period + ', Game time: ' + game.status.displayClock;
							} else if (game.status.period !== 0) {
								message += '<br>Final score:';
							}
							message += '<br>' + teamName0 + ': ' + team0.score + '<br>' + teamName1 + ': ' + team1.score + '<br>'; 
						} else {
							const time = ' with ' + game.status.displayClock + ' to go in the ' + game.status.period + 'st/nd half';
							if (teamName0.toLowerCase().includes(payload)) {
								if (game.status && game.status.period === 0) {
									message = 'The ' + teamName0 + ' game starts later today';
								} else if (team0.hasOwnProperty('winner')) {
									let status = ' lost';
									if (team0.winner === true) {
										status = ' won';
									}
									message = 'The ' + teamName0 + status + ' their game ' + team0.score + ' - ' + team1.score + ' against ' + teamName1 + '!';
								} else if (!team0.winner && team0.score) {
									message = 'Current score for the ' + teamName0 + ' game against the ' + teamName1 + ' is: <br> ' + team0.score + ' - ' + team1.score + time;
								}
							} else if (teamName1.toLowerCase().includes(payload)) {
								if (game.status && game.status.period === 0) {
									message = 'The ' + teamName1 + ' game starts later today';
								} else if (team1.hasOwnProperty('winner')) {
									let status = ' lost';
									if (team1.winner === true) {
										status = ' won';
									}
									message = 'The ' + teamName1 + status + ' their game ' + team1.score + ' - ' + team0.score + ' against ' + teamName0 + '!';
								} else if (!team1.winner && team1.score) {
									message = 'Current score for the ' + teamName1 + ' game against the ' + teamName0 + ' is: <br>' + team1.score + ' - ' + team0.score + time;
								}
							}
						}
					});

					if (!message) {
						message = payload.substring(0, 1).toUpperCase() + payload.substring(1) + ' isn\'t playing today!';
					}
					responseMsg = '{ "type": "message", "text": "<b>Updates:</b> ' + message + '" }';	

					response.write(responseMsg);
					response.end();
				});
			// } else {
			// 	responseMsg = '{ "type": "message", "text": "Error: message sender cannot be authenticated." }';
			// 	response.write(responseMsg);
			// 	response.end();
			// }
		// }
		// catch (err) {
		// 	response.writeHead(400);
		// 	return response.end("Error: " + err + "\n" + err.stack);
		// }
	});
		
}).listen(PORT);

console.log('Listening on port %s', PORT);
