// 10월 25일 수업
// 오랜만에 보는거라서 코드 주석 상세히 설명.(PPT참고)

var express = require('express')
var app = express()

var ejs = require('ejs')

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var mongoose = require('mongoose');
mongoose.connect('mongodb://hello:miro2018@ds052968.mlab.com:52968/mijin', { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("DB와 연결 양호");
});

var Board = require('./models/board');
var User = require('./models/user');

var session = require('express-session')///page 이동시에도 로그인 유지하도록 해 줌
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'tired',
  resave: false,
  saveUninitialized: true,
}));

app.set('views', __dirname + '/public');

app.get('/', function (req, res) {
  Board.find({}, function (err, results) {
    if (err) throw err;
    res.render('list.ejs', { boards: results, user: req.session.user });
  });
});



app.get('/writing', function (req, res) {
  res.render('writing.ejs')
})

app.post('/writing', function (req, res) {
  var board = new Board({
    title: req.body.title,
    content: req.body.content,
    created_at: new Date(),
    modified_at: new Date(),
    author : req.session.user
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/');
});

///////////////////////////////////////////////////////////////////////////////
// 10월 25일 수업 내용 

app.get ("/show/:id", function(req, res){
  Board.findOne({_id: req.params.id}, function(err, boards){//Board.findOne >> DB에서 데이터는 1개를 찾아서 불러온다.
    res.render("show.ejs", {result: boards})///////show.ejs로 해당파일을 연다. 그 파일에 
  })
})
app.post("/destroy/:id", function(req,res){
  Board.deleteOne({_id: req.params.id}, function(err){///Board.remove: DB에서 data 삭제. {_id: req.params.id}>>삭제할 데이터 필터조건 제시(이것과 같은 것?만 지움.)
    res.redirect("/");
  });
})

app.get('/rewrite/:id', function (req, res) {
  Board.findOne({ _id: req.params.id}, function (err, board) {
    res.render("rewrite.ejs", {result: board});
  })
});

app.post('/rewrite/:id', function (req, res) {
  Board.findOne({ _id: req.params.id }, function (err, board) {
    board.content = req.body.inputContent;
    board.created_at = new Date().toISOString();
    board.save(function (err) {
      res.redirect('/show/' + board._id);
    });
  });
});

///////////////////////////////////////////////////////////////////////////////
app.get('/signUp', function(req,res){
  res.render('signUp.ejs')
})
app.get('/login', function (req,res){
  if(req.session.user){
    console.log('you have got already login')
    res.redirect('/')
  }else{
    res.render('login.ejs')
  }
  
})
app.post('/login', function (req,res) {
  User.findOne({id:req.body.id}, function(err, user) { ///findOne : 일치하는 아이디 단 하나를 찾음. user라는 이름 하에 찾은 것을 이용함
    if(!user){ ////!user = 1, user = 0;;;;if user를 찾아서 user =1 이면 !user =0 이라서 아무것도 실행하지 않고 다음으로 넘어감
      console.log('wrong id!') ///gitbash 창에 wrong id라는 말을 띄움
      res.redirect('/login')
    }else{ ///user가 하나라도 있으면 이하의 코드를 실행시킴
      if(!user.validateHash(req.body.pw)){ //validateHash: 로그인 시 비밀번호 비교함
        console.log('wrong id!')
        res.redirect('/login')
      }else{
        req.session.user = user.id; //해당(검색한) user의 아이디가 저장됨. >>>_id와는 다른 것임!
        res.redirect('/')
      }
    }
  })
})
app.post('/signUp', function(req, res){ ///signUP을 public 아래 ejs 파일 방식으로 해서 post로 넣어줄 것
  User.find({id : req.body.id}, function(err,user) { ///아이디가 DB에 존재하는 지 확인
    if(err) throw err;
    if(user.length > 0){ //length는 배열의 길이.
      //아이디 존재
    } else {
      var user = new User({
        id: req.body.id,
        pw: req.body.pw
      })
      user.pw = user.generateHash(user.pw); 
      user.save(function(err) {
        if(err) throw err;
        res.redirect('/') ////홈페이지로 보냄
      })
    }
  })
})

app.post('/logout', function(req,res) {
  req.session.destroy(function(err){
    res.redirect('/')
  })
})

app.get("/*", function(req,res){
  res.render("nofind.ejs");
})

app.listen(3000);
/////모든 경우=>젤 위로 올라가면 안 됨. 무조건 젤 마지막에 넣기.