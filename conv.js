// convert binary file to base64 file

var fs = require("fs");

fs.readFile('amegas.mod', function(err, data) {
  if (err) throw err;

  // Encode to base64
  var encodedImage = new Buffer(data, 'binary').toString('base64');

    fs.writeFile('amegas.txt', encodedImage, function (err) {
        if (err) 
	return console.log(err);
        console.log('Done.');
    });

   
// Decode from base64
//  var decodedImage = new Buffer(encodedImage, 'base64').toString('binary');
});
