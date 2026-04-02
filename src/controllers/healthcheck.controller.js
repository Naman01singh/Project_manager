import {ApiResponse} from "../utils/api-response.js";
import {asyncHandler} from "../utils/async-handler.js";
// const healthCheck= async (req,res,next)=>{
//     try{
//         const user= await getUserFromDB(); // Simulating a database call to check if the database is responsive
//         res.status(200).json(new ApiResponse(200,{message:"Server is healthy"}));

//     }catch(error){
        
//     }
// }

const healthCheck= asyncHandler(async (req,res)=>{
    // Simulating a database call to check if the database is responsive
    // const user= await getUserFromDB(); 
    res.status(200).json(new ApiResponse(200,{message:"Server is healthy"}));
});
export {healthCheck};