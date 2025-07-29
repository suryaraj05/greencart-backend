import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
//Register User
export const register=async (req,res)=>{
    try{
        const {name,email,password}=req.body;

        if(!name || !email || !password){
            return res.json({success:false,message:"Missing Details"})
        }
        const existingUser=await User.findOne({email})

        if(existingUser)
            return res.json({success:false,message:"User already exists"})

        const hashedPassword=await bcrypt.hash(password,10)

        const user=await User.create({name,email,password:hashedPassword})

        const token=jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly: true,//prevent javascript to access cookie
            secure: true, //use secure cookies in production
            sameSite:'none' ,//csrf protection
            maxAge:7*24*60*60*1000, //Cookie expiration time

        });
        return res.json({success: true,user: {email: user.email,name:user.name}})
    } catch(error){
        console.log(error.message);
        res.json({success:false,message: error.message})

    }
}

//Login User : /api/user/login

export const login=async(req,res)=>{
    try{
        const {email,password}=req.body;

        if(!email || !password)
            return res.json({success:false,message:"Email and password are required"});

        const user=await User.findOne({email});

        if(!user){
            return res.json({success:false,message:'Invalid email or password'});

        }

        const isMatch=await bcrypt.compare(password,user.password);

        if(!isMatch)
            return res.json({success:false,message:'Invalid email or password'});

        const token=jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly: true,//prevent javascript to access cookie
            secure:true, //use secure cookies in production
            sameSite:'none' ,//csrf protection
            maxAge:7*24*60*60*1000, //Cookie expiration time

        });
        return res.json({success: true,user: {email: user.email,name:user.name}})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message: error.message});

    }
}

//check Auth :/api/user/is-auth

export const isAuth=async(req,res)=>{
    try{
        const userId=req.userId;
        const user=await User.findById(userId).select("-password")
        return res.json({success: true,user})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}

//Logout User: /api/user/logout

export const logout=async(req,res)=>{
    try{
        // console.log("before logo out : " , res)
        // res.clearCookie('token',{
        //     httpOnly:true,
        //     secure:true,
        //     sameSite:'None' ,
        // });

        res.clearCookie('token');


        // console.log("after logo out : " , res.cookies)
        return res.json({success:true,message:"Logged Out"})

        
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}
