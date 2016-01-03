#!/bin/bash

node_modules/backand/bin/backand create --master  b83f5c3d-3ed8-417b-817f-708eeaf6a945   --user 757e33ac-ad5a-11e5-be83-0ed7053426cb   --app  cli --object '
[{ "name" : "books",   "fields": {    "title": { "type" : "string", "required" : true },   "author": { "type": "string", "required" : true }   }  }]
'

[{"name":"books","fields":{"title":{"type":"string","required":true},"author":{"type":"string","required":true}}}]

node_modules/backand/bin/backand get --master  b83f5c3d-3ed8-417b-817f-708eeaf6a945   --user 757e33ac-ad5a-11e5-be83-0ed7053426cb   --app  cli --object items

node_modules/backand/bin/backand sync --master b83f5c3d-3ed8-417b-817f-708eeaf6a945 --user 757e33ac-ad5a-11e5-be83-0ed7053426cb  --app cli --folder ./src