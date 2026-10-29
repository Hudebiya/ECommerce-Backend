import userModel from "../models/users.model.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
}

async function registerUser(req, res) {
   try {
    const { username,email, password } = req.body;

    const userAlreadyExists= await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(userAlreadyExists){
        return res.status(409).json({
            message:"User Already Exists"
        })
    }

    const hash = await bcrypt.hash(password, 10);

    const user= await userModel.create({username,email, password:hash,role:"user"})
    const token= jwt.sign({
        id: user._id,
        role: user.role
    },process.env.JWT_SECRET_KEY)

    res.cookie("token",token,cookieOptions)

    res.status(201).json({
        message:"User created sucessfully",
        user: { id: user._id, name: user.username, email: user.email, role: user.role },
        token
    })
   } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    
   }
}

async function loginUser(req, res) {
    const {username, email, password } = req.body;
    const user = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(!user){
        return res.status(404).json({
            message:"User not found"
        })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({
            message:"Invalid password"
        })
    }

    const token= jwt.sign({
        id: user._id,
        role: user.role
    },process.env.JWT_SECRET_KEY)

    res.cookie("token",token,cookieOptions)

    res.status(200).json({
        message:"User logged in sucessfully",
        user: { id: user._id, name: user.username, email: user.email, role: user.role },
        token
    })
    

}

async function getCurrentUser(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(401).json({ message: "User session is no longer valid" })
        }

        res.status(200).json({
            user: { id: user._id, name: user.username, username: user.username, email: user.email, role: user.role }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Unable to check session" })
    }
}

function logoutUser(req, res) {
    res.clearCookie("token", cookieOptions)
    res.status(200).json({ message: "User logged out successfully" })
}

export { registerUser, loginUser, getCurrentUser, logoutUser }