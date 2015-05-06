var current = 0;

return function (data, callback) {
    current += data;
    callback(null, current);
} 