var express = require("express");

var app = express();

var mysql = require("mysql");

var cors = require('cors');

var bcrypt=require("bcrypt");

var bodyParser = require("body-parser");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var salt=bcrypt.genSaltSync(10);

var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "demo",
});

conn.connect(function (err) {
  if (err) throw err;
  console.log("Connection Sucessful");
});


app.post("/insertData", function (req, res) {
  var name = req.body.name;
  var password = req.body.password;
  var email = req.body.email;
  var encrypted=bcrypt.hashSync(password,salt);
  console.log(name);

  var sql = `insert into users(name, email, password) values( '${name}', '${email}', '${encrypted}')`;

  conn.query(sql, function (err, results) {
    if (err) throw err;

    res.json("<h1>Data Inserted Successfully in table2.</h1>");
  });
});

app.get("/getdata", function (req, res) {
  var name = req.query.name;
  var password=req.query.password;
  console.log(name);
  var sql = `select * from users where name='${name}';`;
  console.log(sql);
  conn.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results[0].password);
    if(bcrypt.compare(password,results[0].password))
    {
      res.send("Matched");
    }
    else
    {
      res.send("Not Matched");
    }
  });
});


app.delete("/deletedata", function (req, res) {
  var id = req.body.id;
  var name=req.body.name;
  

  var sql = `delete from users where id='${id}'`;
  console.log("deleting id="+id);
  console.log("deleting name="+name);

  conn.query(sql, function (err, results) {
    if (err) throw err;
    if(results.affectedRows ==0){
      res.send("<h1>Data deleted with no row effected.</h1>");
    }
    else{
      res.send("<h1>Data deleted Successfully in table2.</h1>");
    }
  });
});

app.put("/updatedata", function (req, res) {

  var id = req.body.id;
  var name = req.body.name;
  var password = req.body.password;
  var email = req.body.email;
  
  console.log(sql);
  var sql = `update users set name ='${name}', password= '${password}', email='${email}' where id='${id}'`;
  console.log(sql);
  conn.query(sql, function (err, results) {
    if (err) throw err;

    res.send("<h1>Data updated Successfully in table2.</h1>");
  });
});





var server = app.listen(4000, function () {
  console.log("App running on port 4000");
});