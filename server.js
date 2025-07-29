import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';
import connectDB from "./configs/db.js";
import 'dotenv/config'
import userRouter from "./routes/userRouter.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { stripeWebhooks } from "./controllers/orderController.js";


const app=express();
const port=process.env.PORT || 4000;

await connectDB();
await connectCloudinary()

const allowedOrigins=[process.env.CLIENT_URL];

app.use(cors({origin: allowedOrigins, credentials: true}));

app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

//Middleware configurations
app.use(express.json());
app.use(cookieParser());


app.get('/',(req,res)=> res.send("API is working"));
app.use('/api/user',userRouter)
app.use('/api/seller',sellerRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/address',addressRouter)
app.use('/api/order',orderRouter)



app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})






// /*bcryptjs: For hashing and verifying passwords securely.

// cloudinary: For uploading and managing images/files in the cloud.

// cookie-parser: Middleware to parse cookies from HTTP requests.

// cors: Middleware to enable Cross-Origin Resource Sharing (CORS), allowing your API to be accessed from other domains (like your frontend).

// dotenv: Loads environment variables from a .env file into process.env.

// express: The main web framework for building REST APIs and web servers.

// jsonwebtoken: For creating and verifying JWT tokens, commonly used for authentication.

// mongoose: ODM (Object Data Modeling) library for MongoDB, helps interact with your database using models.

// multer: Middleware for handling file uploads (e.g., images, documents) in Express.

// stripe: Stripe API client for handling payments and transactions.
// Summary:
// These packages together provide authentication, file uploads, payment processing, database interaction, and essential middleware for building a full-featured backend API.

// */

