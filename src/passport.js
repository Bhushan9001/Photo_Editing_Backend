const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const prisma = require('./prisma')
var opts = {}

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;
passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {

    try {

        const user = await prisma.user.findUnique({
            where: {
                id: jwt_payload.id
            }
        })

        // console.log(user);
        if (user) return done(null, user);

    } catch (error) {
        return done(error, false)
    }
}));