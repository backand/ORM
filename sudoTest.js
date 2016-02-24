var wincmd = require('node-windows');

wincmd.list(function(svc){
    console.log(svc);
},true);