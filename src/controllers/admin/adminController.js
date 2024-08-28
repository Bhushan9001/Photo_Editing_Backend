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
        const { email, password } = req.body
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
          id: user.id,
          role:"admin"
        }
  
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  
        res.status(201).json({ "Message": "User Loged in Succesfully!!", user, "token": "Bearer " + token });
      } catch (error) {
        res.status(500).json({ "error": error });
        console.log(error);
      }
    },
    create: async(req,res)=>{
      try {
        const { username, email, password, role } = req.body;
        const adminRole = req.user.role;
        if(adminRole != 'SUPER_ADMIN') return res.status(403).json({"message":"You don't have privilages to create admin"})
        // Validate input
        if (!username || !email || !password) {
          return res.status(400).json({ "message": "Username, email, and password are required" });
        }
  
        // Validate role
        const validRoles = ['EDITOR', 'MANAGER', 'SUPER_ADMIN']; // Add all your AdminRole enum values here
        if (role && !validRoles.includes(role)) {
          return res.status(400).json({ "message": "Invalid role specified" });
        }
  
        // Check if username or email already exists
        const existingAdmin = await prisma.admin.findFirst({
          where: {
            OR: [
              { username: username },
              { email: email }
            ]
          }
        });
  
        if (existingAdmin) {
          return res.status(400).json({ "message": "Username or email already exists" });
        }
  
        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);
  
        // Create new admin
        const newAdmin = await prisma.admin.create({
          data: {
            username,
            email,
            password: hashedPassword,
            role: role || undefined, // If role is not provided, it will default to EDITOR
          }
        });
  
        // Remove password from response
        const { password: _, ...adminWithoutPassword } = newAdmin;
  
        res.status(201).json({
          "message": "Admin created successfully",
          "admin": adminWithoutPassword
        });
  
      } catch (error) {
        console.error(error);
        res.status(500).json({ "error": "Internal server error" });
      }
    },
    }
  
  module.exports = {authController}  