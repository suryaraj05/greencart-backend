import User from "../models/User.js";


export const updateCart =async(req,res)=>{
    try{
        const {userId}=req;
        const cartItems = req.body.cartItems;

        await User.findByIdAndUpdate(userId,{cartItem:cartItems})

        res.json({success: true,message: "Cart updated"})
        
    }
    catch(error){
        console.log(error.message);
        res.json({succes :false,message:error.message})
    }

}