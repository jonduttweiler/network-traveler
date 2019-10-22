# network-traveler

This project allows us to visit a vis-network (https://github.com/visjs/vis-network), following a sequence of nodes ids.  
It retrieves the network and the sequence of nodes from json files, next using webpack make a bundle which is included in the main html file.
This way we can make a the presentation of the network by copying only the html and the javascript file. 
This will run completely offline since all dependencies are packaged as static files, and doesn't need any web server. 
We can open the file using the browser directly, using the file protocol.  
  
If you want to generate a presentation of a network, export it in json format, and place it in ./data/network.json.
You must also specify the ids sequence in ./data/travel.json

Then run **npm run build** to generate the bundle. Now you can run your presentation offline.

#api.js  
api.js exposes an API rest on port 3000. This has only an endpoint of POST type. Receives a JSON-encoded request, and return a zip file.
The request body contains two keys (network, travel)
Network is a json object that represents a network. This contains nodes, edges and options.
Travel is a json array with a sequence of IDs to make a travel over the network.

node api.js
or
forever start api.js


