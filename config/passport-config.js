const LocalStrategy = require('passport-local').Strategy
const brcypt = require('bcrypt')
 const {PrismaClient} = require('@prisma/client')
 const prisma = new PrismaClient()

async function initialize(passport, getUserByEmail, getUserById) {
    authenticateUser = async (email,password, done) => {
        //const user = getUserByEmail(email)
        const user = await prisma.user.findUnique({
            where : {email}
        })
        if(user == null) return done(null, false, {message: 'No User with that email'})
        try {
            if(await brcypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, {message:'password incorrect'})
            }
        } catch (error) {
            return done(error)
        }

    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user,done) => {
        const {id, name, role} = user
        return done(null, {id,name, role})
    })
    passport.deserializeUser((id,done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize