import jwt from 'jsonwebtoken';

const authUser=async (req,res,next)=>{


    const {token}=req.cookies;

    // console.log(req.cookies)

    if(!token){
        return res.json({success: false,message:'Not Authorized first'});
    }

    try{
        const tokenDecode=jwt.verify(token,process.env.JWT_SECRET)
        if(tokenDecode.id){
        //    console.log(tokenDecode.id);
        //    console.log(token);
           req.userId=tokenDecode.id;
        }
        else{
            return res.json({success:false,message: 'Not Authorized second'});
        }
        next();
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    }

}


export default authUser;