# Overview
Framework spring hackathon project for retrieving March Madness scores using a Microsoft Teams webhook bot for channels.

# Setup
1. Clone repo and run ```yarn``` inside root folder.
2. Install ngrok and run ```ngrok http 8080```.
3. Inside your Microsoft Teams channel, select the triple ellipses next to the team name on the left rail sidebar and select 'Manage Team'
4. Select the Apps tab and click 'Create an outgoing webhook' at the bottom of the screen.
5. Fill out name (MADNESS) and set the callback URL to the provided 'Forwarding' https URL in your ngrok console.
6. Start your local Node.js server using ```yarn start```.

# How to
@MADNESS to get all scores, @MADNESS [insert school or team name here] to get a specific team score.
