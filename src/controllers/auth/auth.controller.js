// import { sendEmail } from "../../lib/email.js";
import { checkPassword, hashPassword } from "../../lib/hash.js";
// import { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../lib/token.js";
import { User } from "../../models/user.model.js";
import { loginSchema , registerSchema} from "../auth.Schema.js";
import jwt from 'jsonwebtoken';


export const registerHandler = async (req, res) => {
         try {

             const result = registerSchema.safeParse(req.body);
              if(!result.success){
              return res.status(400).json({
                message: 'Invalid data', errors:result.error.flatten()
               })
            }



        const {email, password, name} =result.data;
        
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({email: normalizedEmail})

        if(existingUser){
            return res.status(409).json({
                message: 'Email already in user. Use different email'
            })
        }

        const passwordHash = await hashPassword(password);

        const newlyCreatedUser = await User.create({
            email: normalizedEmail,
            passwordHash,
            name,
        });

         res.json({message: 'User registered successfully'})

         } catch (error) {
        res.status(500).json({ message: "Server error", error });
        }
}

// Login handler
export const loginHandler = async (req, res) => {
    try {

         const result = loginSchema.safeParse(req.body);
              if(!result.success){
              return res.status(400).json({
                message: 'Invalid data', errors:result.error.flatten()
               })
            }



        const {email, password} =result.data;
        
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({email: normalizedEmail})

        if(!existingUser){
            return res.status(409).json({
                message: 'Email not found. Please register first.'
            })
        }

         const ok = await checkPassword(password, existingUser.passwordHash);
         
              if(!ok){
                return res.status(400).json({
                    message: 'Incorrect password'
                })
              }

          const token = jwt.sign(
            {id: existingUser._id},
            process.env.JWT_ACCESS_SECRET,
            {expiresIn: '7d'}
         )
        res.json({message: 'Login successful', token})



        
    }  catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

// export const getCurrentUserHandler = async (req, res) => {
//   try {
//    const userId = req.user.sub || req.user.id;  // sub is userId
//     res.json({ user });
    
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };


export const getCurrentUserHandler = async (req, res) => {
  try {
    console.log("req.user:", req.user); // ← add karo
    const userId = req.user.sub || req.user.id;
    console.log("userId:", userId); // ← add karo
    const user = await User.findById(userId);
    console.log("user:", user); // ← add karo
    res.json({ user });
  } catch (error) {
    console.error("getCurrentUser error:", error); // ← add karo
    res.status(500).json({ message: "Server error" });
  }
};


// function getAppUrl(){
//     return process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
// }


// export async function registerHandler(req, res){
//     try {
//         const result = registerSchema.safeParse(req.body);

//         if(!result.success){
//             return res.status(400).json({
//                 message: 'Invalid data', errors:result.error.flatten()
//             })
//         }
        
//         const {email, password, name} =result.data;
        
//         const normalizedEmail = email.toLowerCase().trim();

//         const existingUser = await User.findOne({email: normalizedEmail})

//         if(existingUser){
//             return res.status(409).json({
//                 message: 'Email already in user. Use different email'
//             })
//         }

//         const passwordHash = await hashPassword(password);

//         const newlyCreatedUser = await User.create({
//             email: normalizedEmail,
//             passwordHash,
//             role: 'user',
//             isEmailVerified: false,
//             // twoFactorEnabled: false
//             name,
//         })

//         const verifyToken = jwt.sign(
//             {
//                 sub: newlyCreatedUser.id,
//             },
//             process.env.JWT_ACCESS_SECRET,
//             {
//                 expiresIn: '1d'
//             }
//         )


//         const verifyUrl = `${getAppUrl()}/api/auth/verify-email?token=${verifyToken}`;

//         await sendEmail(
//             newlyCreatedUser.email,
//             "Verify your email",
//              `<p>Please verify your email by clicking the link below:</p>
//              <p><a href="${verifyUrl}">${verifyUrl}</a></p> `
//         )

//         return res.status(201).json({
//             message: 'User registered',
//             user: {
//                 id: newlyCreatedUser.id,
//                 email: newlyCreatedUser.email,
//                 role: newlyCreatedUser.role,
//                 isEmailVerified: newlyCreatedUser.isEmailVerified,
//             }
//         })


//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             message: 'Internal server error',
//             error: (error).message
//         })
//     }
// }


// export async function verifyEmailHandler(req,res){
//     const token = req.query.token;

//     if(!token){
//         return res.status(404).json({message: 'Verification is missing'})
//     }

//     try {

//         const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

//         const user = await User.findById(payload.sub);

//         if(!user){
//             return res.status(404).json({message: 'User not found'})
//         }

//         if(user.isEmailVerified){
//             return res.status(400).json({message: 'Email is already verified'})
//         }

//         user.isEmailVerified = true;
//         await user.save();

//         return res.status(200).json({message: 'Email is now verified successfully! You can login now'})
        
//     } catch (error) {
//          console.log(error)
//         return res.status(500).json({
//             message: 'Internal server error'
//         })
//     }
// }


// export async function loginHandler(req, res){
//     try {
//         const result = loginSchema.safeParse(req.body);
             
//            if(!result.success){
//               return res.status(400).json({
//                 message: 'Invalid data', errors: result.error.flatten()
//               })
//            }

//            const {email, password} = result.data;
//            const normalizedEmail = email.toLowerCase().trim();

//            const user = await User.findOne({email: normalizedEmail});

//            if(!user){
//             return res.status(404).json({
//                 message: 'User not found'
//             })
//            }

//            const ok = await checkPassword(password, user.passwordHash);
//               if(!ok){
//                 return res.status(400).json({
//                     message: 'Incorrect password'
//                 })
//               }
            
//               if(!user.isEmailVerified)
//               {
//                 return res.status(403).json({
//                     message: 'Email is not verified. Please verify your email before login'
//                 })
//               }

//               const accessToken = createAccessToken(
//                 user.id,
//                 user.role ,
//                 user.tokenVersion
//               );

//               const refreshToken = createRefreshToken(
//                 user.id,
//                 user.tokenVersion
//               )

//               const isProd = process.env.NODE_ENV === 'production';

//               res.cookie("refreshToken", refreshToken, {
//                 httpOnly: true,
//                 secure: isProd,
//                 sameSite: 'strict',
//                 maxAge: 7*24 * 60 * 60 * 1000 // 7 days
//               });


//                return res.status(200).json({
//             message: 'Login successful',
//             accessToken,
//             user: {
//                 id: user.id,
//                 email: user.email,
//                 role: user.role,
//                 isEmailVerified: user.isEmailVerified,
//                 twoFactorEnabled: user.twoFactorEnabled,

//             }
//           })


//     } catch (error) {
//          console.log(error)
//         return res.status(500).json({
//             message: 'Internal server error'
//         })
//     }
// }



// export async function refreshHandler(req, res){
//     try {
//         const token = req.cookies?.refreshToken;

//         if(!token){
//             return res.status(401).json({message: 'Refresh token is missing'})
//         }

//         const payload = verifyEmailHandler(token);
//         const user = await User.findById(payload.sub);
//         if(!user){
//             return res.status(404).json({message: 'User not found'})
//         }

//         if(user.tokenVersion !== payload.tokenVersion)
//         {
//             return res.status(401).json({message: 'Invalid refresh token'})
//         }

//         const newAccessToken = createAccessToken(
//             user.id,
//             user.role,
//             user.tokenVersion
//         )

//         const newRefreshToken = createRefreshToken(
//             user.id,
//             user.tokenVersion
//         )

//         const isProd = process.env.NODE_ENV === 'production';

//         res.cookie("refreshToken", newRefreshToken, {
//             httpOnly: true,
//             secure: isProd,
//             sameSite: 'strict',
//             maxAge: 7*24 * 60 * 60 * 1000 // 7 days
//         });

//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             message: 'Internal server error'
//         })
//     }
// }


// export async function logoutHandler(req, res){
//     res.clearCookie("refreshToken",{path:'/'}) // where does res.clearCookie come from? res.clearCookie is a method provided by the Express response object that allows us to clear a cookie from the client's browser. In this case, we are using res.clearCookie("refreshToken", {path: '/'}) to clear the refresh token cookie when a user logs out. The first argument is the name of the cookie we want to clear (in this case, "refreshToken"), and the second argument is an options object where we specify the path of the cookie (in this case, '/'). This ensures that the refresh token cookie is removed from the client's browser, effectively logging the user out and preventing them from using the refresh token to obtain new access tokens in the future.
    
//     return res.status(200).json({message: 'Logged out successfully'});

// }
