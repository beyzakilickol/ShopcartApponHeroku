//----------------configuration---------------------------
const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const app = express()
var session = require('express-session')
// import the pg-promise library which is used to connect and execute SQL on a postgres database
const pgp = require('pg-promise')()
// connection string which is used to specify the location of the database
const connectionString = process.env.DB_CONN
// creating a new database object which will allow us to interact with the database
const db = pgp(connectionString)
const dotEnv = require('dotenv').config()
const models = require('./models') //sequelize config
const PORT = process.env.PORT || 3008;

  const config = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: true
  }
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('css'))
app.use(express.static('images'))
app.use(express.static('scss'))
app.use(express.static('js'))
app.use(express.static('fonts'))
app.use(express.static('vendor/jquery'))

app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')
app.use(session({
  secret: 'cat',
  resave: false,
  saveUninitialized: false
}))
app.listen(PORT,function(req,res){
  console.log("Server has started...")
})
//------------------------------------------------------
//--------middleware------------------
let authenticateLogin = function(req,res,next) {

 // check if the user is authenticated
 if(req.session.username) {
   next()
 } else {
   res.redirect("/login")
 }

}
app.all("/",authenticateLogin,function(req,res,next){
   next()
})
//---------------------------------
app.get('/',function(req,res){

  models.store.findAll({
    where: {
      userid: req.session.userId
    },
    include:[
      {
        model : models.item,
        as: 'items'
      }
    ]
  }).then(function(stores){
    if(req.session.username){
      res.render('index',{stores:stores, username:req.session.username})
    } else{
      res.render('index',{stores:stores})
    }

  })

})
app.post('/add_store',function(req,res){
  let name = req.body.name
  let street = req.body.street
  let city = req.body.city
  let state = req.body.state
  let userid = req.session.userId
let store = models.store.build(
  {name:name, street:street,city:city,state:state, userid : userid}
)
store.save().then(function(){
  res.redirect('/')
})

})
app.get('/delete/:id',function(req,res){
  let storeId = req.params.id
  models.store.findById(storeId).then(function(store){
    return store.destroy()

  }).then(function(){
    res.redirect('/')
  })

})
app.post('/add_item',function(req,res){
  let item = req.body.item
  let storeId = req.body.storeId
  console.log("store id is " + storeId)
   models.item.build({
    name : item,
    storeid: storeId
  }).save().then(function(newItem){
    console.log(newItem)
    res.redirect('/')
  })
  .catch(function(error){
    console.log(error)
  })


})
app.get('/deleteItem/:id', function(req,res){
  let itemId = req.params.id
  models.item.findById(itemId).then(function(item){
    return item.destroy()
  }).then(function(){
    res.redirect('/')
  })
})
app.get('/login',function(req,res){
  res.render('login')
})

app.post('/signup',function(req,res){
  let username = req.body.username
  let email = req.body.email
  let password = req.body.password
  models.user.findOne({

    where:{
      $or: [
        {
   email: email
 },
 {
   username: username
 }
]
    }
  }).then(function(user){
       if(user != null){
         res.render('login', {message : "This username/email is already taken.Please try to register with different credentials"})
       } else {
         models.user.build({
           username:username,
           email:email,
           password:password
         }).save().then(function(){
           res.redirect('/login')

         })
       }
  })
.catch(function(error){
    console.log(error)
    alert(error)
  })
})
app.post('/login', function(req,res){
  let username = req.body.your_username
  let password = req.body.your_password
 let user = models.user.findOne({
  where:{
    username:username,
    password: password
  }
}).then(function(user){
  if(user != null){
    req.session.username = user.username
    req.session.userId = user.id
    console.log(req.session.userId)
    res.redirect('/')
  } else {
     res.render('login', {message : "Invalid credentials, please try again or register"})
  }
}).catch(function(error){
  res.redirect('/login')
})

})
app.get('/logout',function(req,res){
  req.session.destroy()
  res.redirect('/login')
})
