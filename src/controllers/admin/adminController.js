const bcrypt = require('bcryptjs'); // used to hash/encrypt the password
const prisma = require('../../prisma');
const jwt = require('jsonwebtoken');
  
const authController = { // user Authentication Controller 
    signup: async (req, res) => {  
      // console.log(req.body);
      try {
        const { email, password , username } = req.body;
        if(password.lenght < 6){
          res.status(401).json({"message":"Password should be greater than 6 characters"});
        }
        const hashed_password = bcrypt.hashSync(password, 10);
        
        const admin = await prisma.admin.create({
          data: {
            email: email,
            username:username,
            password: hashed_password,
          }
        });
        
        res.status(200).json({ "message":"succesfully signed up" });
      } catch (error) {
        res.status(500).json({ "error": error })
        console.log(error);
      }
    },
   
    signin: async (req, res) => {
      try {
        const { email, password , username } = req.body
        // console.log(req.body);
        const user = await prisma.admin.findUnique({
          where: {
            email
          }
        })
      //   console.log(user);
        if (!user) return res.status(401).json({ "error": "No user with this email" })
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ "error": "Incorrect Password" });
  
  
        const payload = {
          email: email,
          id: user.id
        }
  
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  
        res.status(201).json({ "Message": "User Loged in Succesfully!!", user, "token": "Bearer " + token });
      } catch (error) {
        res.status(500).json({ "error": error });
        console.log(error);
      }
    }
  }
  
  module.exports = {authController}  