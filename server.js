// import dotenv from 'dotenv';
// dotenv.config();

import 'dotenv/config';

import { connectDB } from "./src/config/db.js";
import http from 'http';
import app from './src/app.js';
// import client from "./src/utils/openai.js";
import googleAuthRoutes from "./src/routes/authGoogleRoutes.js";
import passport from "./src/config/passport.js";




async function startServer(){
    await connectDB();
    
    const server = http.createServer(app);
    
    server.listen(process.env.PORT, ()=> {
        console.log(`Server is running on port ${process.env.PORT}`)
    })   
}

app.use(passport.initialize());
app.use("/api/auth", googleAuthRoutes);

startServer().catch((error)=> {
    console.error('Error starting server:', error);
    process.exit(1);
});