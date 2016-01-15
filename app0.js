var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var Q = require('q');
var router = express.Router();
var multer = require('multer');

var app = express();

var upload = function (req, res) {
  var deferred = Q.defer();
  var filePath = __dirname +  '/public/uploads';
  var storage = multer.diskStorage({
    // 서버에 저장할 폴더
    destination: function (req, file, cb) {
      cb(null, filePath);
    },

    // 서버에 저장할 파일 명
    filename: function (req, file, cb) {
      file.uploadedFile = {
        name: file.originalname,
        ext: file.mimetype.split('/')[1]
      };
      console.log(file);
      cb(null, file.uploadedFile.name);
    }
  });

  var upload = multer({
    storage: storage
   }).single('file');

  upload(req, res, function (err) {
    if (err) deferred.reject();
    else deferred.resolve(req.file.uploadedFile);
  });
  return deferred.promise;
};

var uploading = multer({
  dest: __dirname +  'public/uploads',
  limits : {fileSize : 10000000, files:1}
});

mongoose.connect(process.env.WUS_MONGODB);
var db = mongoose.connection;

db.once("open", function(){
  console.log("DB connected!");
});

db.on("error", function(err){
  console.log("DB ERROR : ", err);
});

app.set("view engine", 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
// 외부에서 json으로 데이터 전송을 할 경우 받는 body parser
app.use(bodyParser.json());
// 웹사이트내에서 json으로 데이터를 전송 할 경우 받는 body parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(router);

// app.use(methodOverride("_method"));

// model setting
var postSchema = mongoose.Schema({
  title : {type:String, required:true},
  body : {type:String, required:true},
  createAt : {type:Date, default:Date.now},
  updateAt : {type:Date}
});
var Post = mongoose.model("post", postSchema);

// new post page
app.get('/posts/upload', function(req, res){
  res.render('posts/upload');
});

router.post('/posts/upload', function(req, res){
  console.log(req.params);
  upload(req, res).then(function (file) {
    res.json(file);
  }, function (err) {
    console.log(err);
    res.send(500, err);
  });
});

module.exports = router;

app.listen(3000, function(){
  console.log('Sever On!!!!!!!!!');
});
