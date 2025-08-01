import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe"
import User from "../models/User.js";
//place order COD :/api/order/cod
export const placeOrderCOD =async(req,res)=>{
    try{
        const userId=req.userId;
        const {items,address}=req.body;
        
        if(!address || items.length===0){
            return res.json({succes :false,message:"Invalid data"})
        }

        //calculate amount using items
        let amount= await items.reduce(async (acc,item)=>{
            const product=await Product.findById(item.product);
            return (await acc)+ product.offerPrice + item.quantity;
        },0);
        //add tax change 2%

        amount+= Math.floor(amount*0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType:"COD",
        });

        await User.findByIdAndUpdate(userId, {cartItem: {}});

        return res.json({success: true,message: "Order placed Successfully"})
        
    }
    catch(error){
        return res.json({success :false,message:error.message})
    }

}

//place order COD :/api/order/stripe
export const placeOrderStripe =async(req,res)=>{
    try{
        const userId=req.userId;
        const {items,address}=req.body;
        const {origin} =req.headers;

        if(!address || items.length===0){
            return res.json({succes :false,message:"Invalid data"})
        }

        let productData=[];
        //calculate amount using items
        let amount= await items.reduce(async (acc,item)=>{
            const product=await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return (await acc)+ product.offerPrice + item.quantity;
        },0);
        //add tax change 2%

        amount+= Math.floor(amount*0.02);

        const order=await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType:"Online",
        });

        //Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        //create line items for stripe
        const line_items=productData.map((item)=>{
            return {
                price_data: {
                    currency: "usd",
                    product_data:{
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price + item.price*0.02)*100
                },
                quantity: item.quantity,
            }
        })

        //create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })

       return res.json({success: true, url: session.url});
        
    }
    catch(error){
        return res.json({success :false,message:error.message})
    }

}

//STRIPE Webhooks to verify Payments Action: /stripe

export const stripeWebhooks= async (request,response)=>{
    const stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY);

    const sig= request.headers["stripe-signature"];
    let event;
    try{
        event= stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch(error){
        response.status(400).send(`Webhook Error :${error.message}`)
    }

    //Handle the event

    switch(event.type){
        case "payment_intent.succeeded" :{
            const paymentIntent=event.data.object;
            const paymentIntentId = paymentIntent.id;

            //Getting Session Metadata

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const {orderId,userId} =session.data[0].metadata;

            //Mark payment as paid
            await Order.findByIdAndUpdate(orderId,{isPaid: true})
            //clear user cart

            await User.findByIdAndUpdate(userId, {cartItem: {}});

            break;
        }
        case "payment_intent.payment_failed" : {
            const paymentIntent=event.data.object;
            const paymentIntentId = paymentIntent.id;

            //Getting Session Metadata

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const {orderId} =session.data[0].metadata;

            await Order.findByIdAndDelete(orderId);
            break;
        }
        default:
            console.error(`Unhandled event type ${event.type}`)
            break;

    
    }
    response.json({recieved: true})

}



//Get Orders by user id : /api/order/user

export const getUserOrders=async(req,res)=>{
    try{
        const {userId}=req;
        const orders=await Order.find({
            userId,
            $or: [{paymentType: "COD"},{isPaid: true}] //either any one true
        }).populate("items.product address").sort({createdAt: -1});

        res.json({success: true,orders});
    }
    catch(error){
        return res.json({success :false,message:error.message})
    }
}


//get all orders (for sellerrs/admin) : /api/order/seller

export const getAllOrders=async(req,res)=>{
    try{
        const {userId}=req;
        const orders=await Order.find({}).populate("items.product address").sort({createdAt: -1});

        res.json({success: true,orders});
    }
    catch(error){
        return res.json({success :false,message:error.message})
    }
}