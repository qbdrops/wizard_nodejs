var fs = require('fs');

var filePath = './node_modules/scrypt/index.js';
 
fs.exists(filePath, (exists) => {
  if (exists) {
    fs.readFile(filePath, (err, data) => {
      if (err) throw err;
      let newData = data.toString().replace('./build/Release/scrypt', 'scrypt')
      fs.writeFile(filePath, newData, (err) => {
        if (err)
          console.log(err);
      });
    });
  }
});
