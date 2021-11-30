 'use strict';

const path = require("path")
const express = require('express');
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const mysql = require('mysql');
var session = require('express-session');
const { dirname } = require("path/posix");


let con = mysql.createConnection({
  host: 'mysql',
  port: '3306',
  user: 'root',
  password: 'admin'
});

const ONE_HOUR = 1000 *60 *60 // An hour from miliseconds
const PORT = 8000;
const HOST = '0.0.0.0';

//session set up

const {
   
    SESSION_TIME = ONE_HOUR,
    NODE_ENV = 'development',
} = process.env

const IN_PROD = NODE_ENV ==='production'

app.use(session({
    secret:'Keep it secret',
    name:'uniqueSessionID',
    resave : false,
    saveUninitialized:false,
    cookie: {
        maxAge : SESSION_TIME,
        sameSite : true ,
        secure : IN_PROD
    }
 }))

const redirectLogin =(req,res,next) => {
   if(!req.session.userID) {
       res.redirect('/login')
   } else {
       next()
   }
}

const redirectHome =(req,res,next) => {
    if(req.session.userID) {
        res.redirect('/home')
    } else {
        next()
    }
 }

 const users = [

    { id :1 , name : 'Hasnain' , email : 'has102@usask.ca' , password : 'secret'}
    
 ]
// Helper



// Create the database
con.connect((err) => {

    if (err) { panic(err) }

    if(con.query)
    con.query("CREATE DATABASE IF NOT EXISTS project", (err, result) => {

        if (err) { panic(err) }

        else { 
               console.log("Database created")
    }
        
    })

    con.query("USE project",(err,result) => {

        if (err) {panic(err)}

        else { console.log("USING database")}

    })})

// Connect to the database

// con.connect((err) => {
//     if (err) {panic(err)}

//     con.query("USE project",(err,result) => {

//         if (err) {panic(err)}

//         else { console.log("USING database")}

//     })
// } 
// )

function create_staff_table() {

    let statement = `CREATE TABLE IF NOT EXISTS Staff (Name varchar(100), Email varchar(100) , Password varchar(8000) , Date_joined TIMESTAMP , PRIMARY KEY (Name) )`
    con.query(statement, (err, result) => {

        if (err) {panic(err) }

        else {console.log("Client table created!")
     //   res.send("OKAY") }

    }

    })
}

function create_client_table() {

    let statement = `CREATE TABLE IF NOT EXISTS clients (Name varchar(100), Age varchar(100) , Report varchar(8000) , Date_joined TIMESTAMP , PRIMARY KEY (Name) )`
    con.query(statement, (err, result) => {

        if (err) {panic(err) }

        else {console.log("Client table created!")
     //   res.send("OKAY") }

    }

    })
}

// Sketch of how to contact your database
function sql_client_insertion(param1, param2, param3,res) {

    let statement = `INSERT INTO clients (Name, Age , Report) VALUES ('${param1}', '${param2}','${param3}')`
    con.query(statement, (err, result) => {

        if (err) {panic(err) }

        else {console.log("Client Inserted!")
        res.send("OKAY") }

    })
}

// Sketch of how to contact your database
function sql_staff_insertion(param1, param2,res) {

    let statement = `INSERT INTO staff (Name, Age , Report) VALUES ('${param1}', '${param2}')`
    con.query(statement, (err, result) => {

        if (err) {panic(err) }

        else {console.log("Staff Inserted!")
        res.send("OKAY") }

    })
}


function sql_request(param1,res) {

    let statement = `SELECT * FROM clients WHERE Name='${param1}'`
    con.query(statement, (err, result) => {

        if (err) { panic(err) }

        else { 
        
               console.log("GOT SUCCESSFULLY !")
               res.send(result)
        }
        console.log(result)                                                       

    })
}
const panic = (err) => console.error(err)

app.get('/', (req,res) =>{

   const{ userID} = req.session
   res.sendFile(__dirname +"/pages/"+"welcome.html")
})

app.get('/home', redirectLogin, function (req, res) {  
    res.sendFile( __dirname + "/pages"+"/" + "posting.html" ); 
    
});

app.get('/home-staff', redirectLogin , function(req,res) {

    res.sendFile(__dirname+"/pages" + "/" + "home-staff.html");
})
  
app.get('/login', redirectHome,(req,res) => {
 
    res.sendFile(__dirname + "/pages"+"/" + "login.html");
  
}) 

app.get('/register',redirectLogin,(req,res) => {

    res.sendFile(__dirname + "/pages" +"/" +"register-staff.html");

})

app.get('/delete-staff',redirectLogin,(req,res)=>{

    res.sendFile(__dirname+"/pages" + "/" + "delete-staff.html");

})

app.get("/get-staff",redirectLogin,(req,res)=>{

    res.sendFile(__dirname+"/pages" + "/" + "get-staff.html");

})

app.post("/get-staff1",(req,res)=>{
     
    
    res.send(users)

})

app.post("/delete-staff",(req,res)=>{

    if(req.body.name){
        const user = users.find(
            user => user.name ===req.body.name 
        )
       // console.log(user.name)
       users.splice(user.id-1, 1);
       console.log(users)
       
       // alert(req.body.name + " is no longer a staff member")    
       //alert(user.name +" is no longer a staff member")
       return res.redirect("/home")

    }

    res.redirect()

})
app.post('/staff-save',(req,res) => {

    sql_request(req.body.RetClientname,res);
    console.log("Retclientname "+req.body.RetClientname)
    console.log(req.body.Clientname)   

  });


app.post('/staff-postmessage', (req,res) => {
    
    create_client_table();
    sql_client_insertion(req.body.Clientname,req.body.Clientage,req.body.Report,res)
    console.log(req.body.Clientname)   
    console.log(req.body.Clientage)

});

app.post('/login',(req,res) => {
    const { email, password} = req.body

    console.log(users)
    if (email && password){

        const user = users.find(
            user => user.email ===email && user.password === password
        )

        if (user) {

            req.session.userID = user.id
            console.log(req.session)
            if(user.id===1){
               res.redirect('/home') 
            }
             res.redirect('/home-staff')
        }
    }

    res.redirect('/login')
})


app.post('/register', (req,res) =>{
    
    const { name , email , password} = req.body

    if (name && email && password) {
        const exists = users.some (
            user => user.email === email
        )

        if(!exists) {
            const user = {
                id : users.length +1,
                name,
                email,
                password
            }

            users.push(user)
            req.session.userID = user.id
            console.log(users);
            return res.redirect('/home')
        }

    }
    res.redirect('/register')
})

/* fill in */

app.get('/logout', redirectLogin,(req,res) =>{
 req.session.destroy(err => {
     if (err){
        return res.redirect('/home')
     }

     res.clearCookie('uniqueSessionID')
     res.redirect('/login')
 })

})




app.post('/save',(req,res) => {

    sql_request(req.body.RetClientname,res);
    console.log("Retclientname "+req.body.RetClientname)
    console.log(req.body.Clientname)   

  });


app.post('/postmessage', (req,res) => {
    
    create_client_table();
    sql_client_insertion(req.body.Clientname,req.body.Clientage,req.body.Report,res)
    console.log(req.body.Clientname)   
    console.log(req.body.Clientage)

});


app.use("/", express.static(path.join(__dirname, "pages")))

app.listen(PORT,HOST);
console.log("up!")
