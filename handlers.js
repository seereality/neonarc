// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Source Code   - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs

var config = require('./config'),
    fs = require('fs'),
    sys = require('sys'),
    exec = require('child_process').exec,
    mongoose = require('mongoose'),
    Grid = require('gridfs-stream'),
    GridStore = require('mongodb').GridStore,
    ObjectID = require('mongodb').ObjectID;

var conn = mongoose.createConnection('localhost', 'test', 27017 );

function home(response) {
    response.writeHead(200, {
        'Content-Type': 'text/html'
    });
    response.end(fs.readFileSync('./static/index.html'));
}

// this function uploads files

function upload(response, postData) {
    var files = JSON.parse(postData);

    // writing audio file to disk
    _upload(response, files.video);
    merge(response, files);

}

// this function merges wav/webm files

function merge(response, files) {
    // detect the current operating system
    var isWin = !!process.platform.match( /^win/ );

    if (isWin) {
        ifWin(response, files);
    } else {
        ifMac(response, files);
    }
}

function _upload(response, file) {
    var fileRootName = file.name.split('.').shift(),
        fileExtension = file.name.split('.').pop(),
        filePathBase = config.upload_dir + '/',
        fileRootNameWithBase = filePathBase + fileRootName,
        filePath = fileRootNameWithBase + '.' + fileExtension,
        fileID = 2,
        fileBuffer;

    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    file.contents = file.contents.split(',').pop();
    var filename = fileRootName+".mp4" || fileExtension;

    fileBuffer = new Buffer(file.contents, "base64");
    var gfs = Grid( conn.db, mongoose.mongo );
    var target = gfs.createWriteStream({
      filename: filePath
    });
    var gridStore = new GridStore(conn.db, new ObjectID(),filename, "w",{metadata:{userId:response.user._id}});

    gridStore.open(function(err, gridStore) {
      // Write some content to the file
      gridStore.write(fileBuffer, function(err, gridStore) {
        // Flush the file to GridFS
        gridStore.close(function(err, fileData) {
          //assert.equal(null, err);
        });
      });
    });
    console.log("filePath",filePath);
    fs.writeFileSync(filePath, fileBuffer);
}

function serveStatic(response, pathname) {

    var extension = pathname.split('.').pop(),
        extensionTypes = {
            'js': 'application/javascript',
            'webm': 'video/webm',
            'mp4': 'video/mp4',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'gif': 'image/gif'
        };

    response.writeHead(200, {
        'Content-Type': extensionTypes[extension]
    });
    if (hasMediaType(extensionTypes[extension]))
        response.end(fs.readFileSync('.' + pathname));
    else
        response.end(fs.readFileSync('./static' + pathname));
}

function hasMediaType(type) {
    var isHasMediaType = false;
    ['audio/wav', 'audio/ogg', 'video/webm', 'video/mp4'].forEach(function(t) {
      if(t== type) isHasMediaType = true;
    });

    return isHasMediaType;
}

function ifWin(response, files) {
    // following command tries to merge wav/webm files using ffmpeg
    var merger = __dirname + '\\merger.bat';
    var audioFile = __dirname + '\\uploads\\' + files.audio.name;
    var videoFile = __dirname + '\\uploads\\' + files.video.name;
    var mergedFile = __dirname + '\\uploads\\' + files.audio.name.split('.')[0] + '-merged.webm';

    // if a "directory" has space in its name; below command will fail
    // e.g. "c:\\dir name\\uploads" will fail.
    // it must be like this: "c:\\dir-name\\uploads"
    var command = merger + ', ' + audioFile + " " + videoFile + " " + mergedFile + '';
    exec(command, function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);
        } else {
            response.statusCode = 200;
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(files.audio.name.split('.')[0] + '-merged.webm');

            fs.unlink(audioFile);
            fs.unlink(videoFile);
        }
    });
}

function ifMac(response, files) {
    // its probably *nix, assume ffmpeg is available
    //var audioFile = __dirname + '/uploads/' + files.audio.name;
    var videoFile = __dirname + '/uploads/' + files.video.name;
    var mergedFile = __dirname + '/uploads/' + files.video.name.split('.')[0] + '-merged.mp4';

    var util = require('util'),
        exec = require('child_process').exec;
        //-qscale 0 
    var command = "ffmpeg -i " + videoFile + " -qscale 0 " + mergedFile;

    exec(command, function (error, stdout, stderr) {
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);

        if (error) {
            console.log('exec error: ' + error);
            response.statusCode = 404;
            response.end();

        } else {
            response.statusCode = 200;
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(files.video.name.split('.')[0] + '-merged.mp4');

            // removing audio/video files
            //fs.unlink(audioFile);
            fs.unlink(videoFile);
            storetoGridfs(mergedFile);
        }

    });
    


}


function storetoGridfs(file){
var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');

var db = new Db('test', new Server('localhost', 27017));
// Establish connection to db
db.open(function(err, db) {
  // Our file ID
  var fileId = new ObjectID();

  // Open a new file
  var gridStore = new GridStore(db, fileId, 'w');

  // Read the filesize of file on disk (provide your own)
  var fileSize = fs.statSync(file || './test/tests/functional/gridstore/test_gs_weird_bug.png').size;
  // Read the buffered data for comparision reasons
  var data = fs.readFileSync(file || './test/tests/functional/gridstore/test_gs_weird_bug.png');

  // Open the new file
  gridStore.open(function(err, gridStore) {

    // Write the file to gridFS
    gridStore.writeFile(file || './test/tests/functional/gridstore/test_gs_weird_bug.png', function(err, doc) {

      // Read back all the written content and verify the correctness
      GridStore.read(db, fileId, function(err, fileData) {
        //assert.equal(data.toString('base64'), fileData.toString('base64'))
        //assert.equal(fileSize, fileData.length);

        db.close();
      });
    });
  });
});
}



exports.home = home;
exports.upload = upload;
exports.serveStatic = serveStatic;
