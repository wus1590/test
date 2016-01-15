var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var app = express();

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

app.use(methodOverride("_method"));

// model setting
var postSchema = mongoose.Schema({
  title : {type:String, required:true},
  body : {type:String, required:true},
  createAt : {type:Date, default:Date.now},
  updateAt : {type:Date}
});
var Post = mongoose.model("post", postSchema);

// get posts
app.get('/posts', function(req, res){
  Post.find({}).sort('-createAt').exec(function(err, posts){
    if (err) return res.json({success:false, message:err});
    res.render("posts/index", {data:posts});
    //res.json({success:true, data:posts});
  });
});

// new post page
app.get('/posts/new', function(req, res){
  res.render('posts/new');
});

// create post
app.post('/posts', function(req, res){
  console.log(req);
  console.log(req.body);
  Post.create(req.body.post, function(err, post){
    if (err) return res.json({success:false, message:err});
    res.redirect('/posts');
    // res.json({success:true, data:post});
  });
});

// get post by id
app.get('/posts/:id', function(req, res){
  Post.findById(req.params.id, function(err, post){
    if (err) return res.json({success:false, message:err});
    res.render("posts/show", {data:post});
    // res.json({success:true, data:post});
  });
});

// edit page
app.get('/posts/:id/edit', function(req, res){
  Post.findById(req.params.id, function(err, post){
    if (err) return res.json({success:false, message:err});
    res.render("posts/edit", {data:post});
    // res.json({success:true, data:post});
  });
});

// update post by id
app.put('/posts/:id', function(req, res){
  req.body.post.updateAt = Date.now();
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post){
    if (err) return res.json({success:false, message:err});
    res.json({success:true, message:post._id + "updated"});
  });
});

// delete post by id
app.delete('/posts/:id', function(req, res){
  Post.findByIdAndRemove(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts');
    // res.json({success:true, message:post._id + "deleted"});
  });
});


app.listen(3000, function(){
  console.log('Sever On!!!!!!!!!');
});
