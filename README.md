
# network-traveler

  

This project allows us to travel through a sequence of snapshots, taken from a vis-network (https:// github.com/visjs/vis-network).

  

It's structured as a simple API rest with a single endpoint (/bundle). This endpoint receives JSON-encode POSTS requests, which body contains both, the network and travel, and return a zip file that bundle all dependencies as static files.

The generated file can run completely offline since all dependencies are packaged, and doesn't need any web server, since we can open the file using the browser directly, using the file protocol.

  

#### Request body

**Network**: *JSONObject*.  It contains nodes, edges and options.
**Travel**: *JSONArray*. Sequence of snapshots (x,y,scale,img) to make a travel over the network.

  

## RUN
```
npm start
or
forever start api.js

```
