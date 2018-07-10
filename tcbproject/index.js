  console.log ("PHAM ANH KHUONG11");

  let date = require('date-and-time');
  var moment = require('moment-timezone');
  var nodemailer = require('nodemailer');

  var express = require ('express');
  var app = require('express')();
  var http = require('http').Server(app);
  var bodyParser = require("body-parser");
  //var session = require('express-session');
  var path = require('path');
  var io = require('socket.io')(http);
  var mqtt = require ('mqtt');
  var url_mqtt = 'mqtt://jmfwmuny:fC7YWBME5x2I@m11.cloudmqtt.com:11192';
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://pakpham:anhkhuong95@pak-shard-00-00-rtdiq.mongodb.net:27017,pak-shard-00-01-rtdiq.mongodb.net:27017,pak-shard-00-02-rtdiq.mongodb.net:27017/pak?ssl=true&replicaSet=pak-shard-0&authSource=admin";
  var admin = {
    user: "hkteam",
    pass: '0907'
  };
  var infoMcu = {timer: '600', timerReal : '3', signal:'', previousSignal: '', warningSaliValue:'3000', warningTemperValue: '30'};


  //
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  //

  // --------------------------------   database name:
  var dbOxi = 'dataOxiLv';
  var dbTemp = 'dataTempLv';
  var dbSali = 'dataSaliLv';
  //-------------------------------
  var timerCheckSignal;
  var stateMcu = 0;
  var currentTemp = 0;
  var currentSali = 0;
  var client = mqtt.connect (url_mqtt);
  var currentSaliValue;
  var currentTempValue;
  var currentTime;
  var previousSaliValue = 0;
  var previousTempValue = 0;
  //--------------------------------   MAIL SETUP
  // MAIL SETUP
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'giamsatmoitruongnuoc@gmail.com',
      pass: 'internetofthings'
    }
  });
  var mailOptions = {
    from: 'HKteam',
    to: 'khuongb1305707@student.ctu.edu.vn,pakpham@gmail.com,next',
    subject: '[Cảnh báo] Hệ thống giám sát môi trường nước',
    html: '<div style="border: solid; border-radius: 30px; padding: 30px">  <h1 style="color: cyan; text-align: center; border: solid;; border-radius: 30px;">HKteam</h1> <h4>Bạn nhận được mail này vì bạn đã đăng kí dịch vụ cảnh báo thay đổi môi trường nước từ chúng tôi.</h5> <h4>Hệ thống đã ghi nhận những thay đổi bất thường từ môi trường:</h4>  <ul>    <li>Vào thời gian: <b style="color: red">time</b></li>    <li>Thông số độ mặn: <b style="color: red">saliValue ppm</b></li>   <li>Thông số nhiệt độ: <b style="color: red">temperValue ℃</b></li> </ul> <h4>Để biết thêm chi tiết, vui lòng nhấp vào <a href="giamsatmoitruongnuoc.herokuapp.com">đây</a>.</h4> <hr>  <h4>Chúng tôi luôn hy vọng mang lại những lợi ích tốt nhất cho bạn. Mọi thông tin, góp ý, đầu tư, vui lòng liên hệ: </h4> <h5><big>Thành viên nhóm dự án.</big></h5>  <ul>    <li>Phạm Anh Khương</li>    <li>Lê Mạnh Hùng</li>   <br>    <li>Gmail: <i>pakpham@gmail.com</i></li>    <li>Facebook: <i>https://www.facebook.com/khuong250117</i></li>   <li>Phone: 096 916 7964</li>  </ul></div>'
  };

  var checkLoginSetting = 0;
  app.use(express.static('public'));

  app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "public" + "/" + "updating.html" );
  });
  app.get('/logs', function (req, res) {
   res.sendFile( __dirname + "/" + "public" + "/" + "logs.html" );
  });


  app.get('/login', function (req, res) {
   res.sendFile( __dirname + "/" + "public" + "/" + "login.html" );
  });

  app.get('/about', function (req, res) {
   res.sendFile( __dirname + "/" + "public" + "/" + "about.html" );
  });

  // app.get('/home', function (req, res) {
  //  res.sendFile( __dirname + "/" + "public" + "/" + "index.html" );
  // });

  app.use(function (req, res, next) {
    res.status(404).sendFile( __dirname + "/" +"public" + "/" + "404.html" );
  });

  app.get('/settings', function (req, res) {
    if (checkLoginSetting == 1 ){
      res.sendFile( __dirname + "/" + "public" + "/" + "setting.html" );
    }
    else {
      res.send('<p>Ban can dang nhap truoc</p>');
      checkLoginSetting = 0;
    }
  });



  var server   =  http.listen(process.env.PORT || 80, function() {
    var host = server.address ().address;
    var port = server.address().port;
    console.log(host);
    console.log ("The server is listen on: http://%s:%s", host, port);
  })
