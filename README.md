# Valorant Record Command
Script(s) to accompany data from api.henrikdev.xyz for use in a chatbot !record command. See more about the underlying HenrikDev API here: https://github.com/Henrik-3/unofficial-valorant-api


## Usage Example (Nightbot)
```!addcom !record $(touser), $(eval $(urlfetch json https://raw.githubusercontent.com/squarebracket/ValorantNightbot/main/script.js)('$(twitch $(channel) "{{uptimeLength}}")','$(twitch $(channel) "{{uptimeAt}}")',"$(querystring $(urlfetch json https://api.henrikdev.xyz/valorant/v1/mmr-history/na/username/tag))", "$(querystring $(urlfetch json https://api.henrikdev.xyz/valorant/v1/lifetime/matches/na/username/tag))", 'PlayerName'))```
 
 Will produce something similar to:
 ```
 PlayerName is UP 46RR this stream. Currently 4W - 1L - 0D.
 ```

Note that in the above example, `username` should be replaced with the player's Riot username, `tag` should be replaced with the player's Riot tag, and `PlayerName` should be replaced with whatever name the bot should use to refer to the player / streamer.


## Limitations
If the stream begins with an L with loss protection (bringing them to 0 RR), or if they begin the stream with a rank up game, and get boosted up to 10 RR in their division with a promotion bonus, the reported RR change value for the stream can be off by a small amount.
