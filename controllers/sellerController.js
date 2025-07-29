import jwt from 'jsonwebtoken';

//Login Seller : /api/seller/login
export const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.cookie('sellerToken', token, {
                httpOnly: true,//prevent javascript to access cookie
                secure: true, //use secure cookies in production
                sameSite:'none',//csrf protection
                maxAge: 7 * 24 * 60 * 60 * 1000, //Cookie expiration time

            });
            return res.json({ success: true, message: "Logged In" });
        }
        else {
            return res.json({ success: false, message: "Invalid Credentials" });
        }
    }
    catch(error){
        console.log(error.message);
        res.json({success: false,message :error.message});
    }
}

//Seller isAuth : /api/seller/is-auth
export const isSellerAuth=async(req,res)=>{
    try{
        return res.json({success: true})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}

//Logout Seller : /api/seller/logout

export const sellerLogoutt=async(req,res)=>{
    try{
        res.clearCookie('sellerToken',{
            httpOnly:true,
            secure:true,
            sameSite:'none' ,
        });
        // res.clearCookie('sellerToken');
        return res.json({success:true,message:"Logged Out"})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}
