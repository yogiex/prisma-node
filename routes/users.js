var express = require('express');
var router = express.Router();
const { PrismaClient, Prisma}  = require('@prisma/client')
const bcrypt = require('bcrypt');
const passport = require('passport');
const { check, validationResult } = require('express-validator')
const prisma = new PrismaClient()

const initializePassport = require('../config/passport-config')
initializePassport(
  passport, 
  email => prisma.user.findUnique({
    where: {
      email:email
    }
  }), 
  id => prisma.user.findUnique({
    where: {
      id:id
    }
  }))
/* GET users listing. */
router.get('/',  async function(req, res, next) {
  const user = await prisma.user.findUnique({})
  res.send(user);
});

//user login
router.get('/login', checkNotAuthenticated, (req,res) => {
  res.render('users/login',{title: 'Login Page'})
})

router.post('/login', checkNotAuthenticated, [
  check('email','This email must required')
  .isEmail()
],(req,res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    //return res.status(422).json({errors:errors.array()})
    let alert = errors.array()
    res.render('users/login',{
      alert,title:'Login Page'
    })
  }
  next()
} ,passport.authenticate('local',{
  successRedirect:'/dashboard',
  failureRedirect:'/users/login',
  failureFlash: true
}))

//user register
router.get('/register', checkNotAuthenticated, (req,res) => {
  res.render('users/register', {title:'Registration Page'})
})

router.post('/register', checkNotAuthenticated,  [
  check('email','This email must required')
    .isEmail()
    .exists()
    .normalizeEmail(),
  check('name','This name must required')
    .exists(),
  check('password')
    .exists()
    .isLength({min:5})
], async (req, res) => {
  const errors = validationResult(req)
    if(!errors.isEmpty()) {
      let alert = errors.array()
      res.render('users/register',{
        alert,title:'Register Page'
      })
    }
  try {
    const hashPassword = await bcrypt.hash(req.body.password,10)
    const user = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword
    }
  })
  res.redirect('/users/login')
  } catch (error) {
      if(error.code === 'P2002') {
        console.log('There is a unique constraint violation, a new user cannot be created with this email')
      }
  }
  res.redirect('/users/register')
})
router.get('/home', (req, res) => {
  res.render('home', {name: req.user.name})
})

router.patch('/:id', async (req,res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id
    }
  })
  res.send(user)
})

router.delete('/:id', async (req, res) => {
  // console.log(typeof req.params.id)
  let idStr = req.params.id.toString()
  const user = await prisma.user.delete({
    where: {
      id: req.params.id
    }
  })
  res.send('deleted')

})

// router.post('/add', async (req, res) => {
//   try {
//     const hashPassword = await bcrypt.hash(req.body.password,10)
//     const user = await prisma.user.create({
//     data: {
//       name: req.body.name,
//       email: req.body.email,
//       password: hashPassword
//     }
//   })
//   res.redirect('/dashboard/user')
//   } catch (e) {
//     if(e.code === 'P2002') {
//       let error = validationResult(req)
//       let alert = error.array()
//       // res.redirect('/dashboard/user')
//       res.send({err:'error with this email'})
      
//     }
//   }
// })
function checkAuthenticated(req,res,next) {
  if(req.isAuthenticated()) return next()
  res.redirect('/login')
}

function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()) return res.redirect('/dashboard')
  next()
}


function role(req,res, next){
  if(req.session.passport.user.role === 'ADMIN') next()
  // next()
  res.send({msg:'not allowed'})
}
//development only
router.get('/tmp',role ,(req,res) => {
  res.send(req.session)

})
module.exports = router;
