import { User } from "../modles/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../modles/project.models.js";
import { ProjectMember } from "../modles/projectmember.models.js";
import mongoose from "mongoose";
import { AvailableUserRole } from "../utils/constants.js";
const getProjects= asyncHandler(async (req, res) => {
    const projects=await ProjectMember.aggregate([
        {
            $match:{
                user:new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
        $lookup:{
            from:"projects",
            localField:"projects",
            foreignField:"_id",
            as:"projectDetails",
            pipeline:[
                {
                    $lookup:{
                        from:"projectmembers",
                        localField:"_id",
                        foreignField:"projects",
                        as:"projectmembers"
                    }
                },
                {
                    $addFields:{
                        members:{
                            $size:"$projectmembers",
                        },
                    },
                },
            ],
        },
    },
    {
        $unwind:"$project"
    },
    {
        $project:{
            _id:1,
            name:1,
            description:1,
            createdAt:1,
            members:1,
            createdBy:1,

        },
        role:1,
        _id:0,
    }
    ]);
    return res.status(200).json(new ApiResponse(200,"Projects fetched successfully",projects));
});

const getProjectById= asyncHandler(async (req, res) => {
    const {projectId} = req.params;
    const project=await Project.findById(projectId);
    if(!project){
        throw new ApiError(404,"Project not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,"Project fetched successfully",project));
});

const createProject= asyncHandler(async (req, res) => {
    const{name, description} = req.body;

    await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user.id),
    })
    await ProjectMember.create(
    { project: new mongoose.Types.ObjectId(project._id)  ,
    user: new mongoose.Types.ObjectId(req.user.id) ,
    role:UserRolesEnum.ADMIN
    }
    )
    return res
    .status(201)
    .json(new ApiResponse(201, "Project created successfully", project));
});

const updateProject= asyncHandler(async (req, res) => {
    const {name,description}=req.body
    const{projectId}=req.params
    await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        {new:true}
    )
    if(!project){
        throw new ApiError(404,"Project not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,"Project updated successfully",project))
});

const deleteProject= asyncHandler(async (req, res) => {
    const {projectId}=req.params

    const project=await Project.findByIdAndDelete(projectId)
    if(!project){
        throw new ApiError(404,"Project not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,"Project deleted successfully",project))
});

const addMembersToProject= asyncHandler(async (req, res) => {
    const {email,role}=req.body
    const {projectId}=req.params
    const user=await User.findOne({email})
    if(!user){
        throw new ApiError(404,"User not found")
    }
    await ProjectMember.findByIdAndUpdate(
        {
        user:new mongoose.Types.ObjectId(user._id),
        project:new mongoose.Types.ObjectId(projectId),
    },
    {
        user:new mongoose.Types.ObjectId(user._id),
        project:new mongoose.Types.ObjectId(projectId),
        role: role
    },
    {
        new:true,
        upsert:true,
    }
)
    return res.status(201).json(new ApiResponse(200,"Member added successfully",user))
});

const getProjectMembers= asyncHandler(async (req, res) => {
    const{projectId}=req.params
    const project=await Project.findById(projectId);
    if(!project){
        throw new ApiError(404,"Project not found")
    }
    const projectMembers=await ProjectMember.aggregate([
        {
            $match:{
                project:new mongoose.Types.ObjectId(projectId),
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"user",
                foreignField:"_id",
                as:"user",
                pipeline:[
                    {
                        project:{
                            _id:1,
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                user:{
                    $arrayElemAt:["$user", 0]
                }
            }
        },
        {
            $project:{
                project:1,
                user:1,
                role:1,
                createdAt:1,
                updatedAt:1,
                _id:0,
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200,"Project members fetched successfully",projectMembers));
});

const updateMemberRole= asyncHandler(async (req, res) => {
    const{projectId,userId}=req.params
    const{role}=req.body
    if(!AvailableUserRole.includes(role)){
        throw new ApiError(400,"Invalid role")
    }
    let projectMember=await ProjectMember.findOneAndUpdate(
        {
            project:new mongoose.Types.ObjectId(projectId),
            user:new mongoose.Types.ObjectId(userId),
        }) 
        if(!projectMember){
            throw new ApiError(404,"Project member not found")
        }
    projectMember=await projectMember.findByIdAndUpdate(
        projectMember._id,
        {
            role:newRole
        },
        {new:true}
    )
    if(!projectMember){
        throw new ApiError(404,"Project member not found")
    }
    return res.status(200).json(new ApiResponse(200,"Project member role updated successfully",projectMember))
});
const deleteMember=asyncHandler(async (req, res) => {
const{projectId,userId}=req.params
    let projectMember=await ProjectMember.findOneAndUpdate(
        {
            project:new mongoose.Types.ObjectId(projectId),
            user:new mongoose.Types.ObjectId(userId),
        }) 
        if(!projectMember){
            throw new ApiError(404,"Project member not found")
        }
    projectMember=await projectMember.findByIdAndDelete(
        projectMember._id,
        {
            role:newRole
        },
        {new:true}
    )
    if(!projectMember){
        throw new ApiError(404,"Project member not found")
    }
    return res.status(200).json(new ApiResponse(200,"Project member role updated successfully",projectMember))
});
export { getProjects, getProjectById, createProject, updateProject, deleteProject,addMembersToProject, getProjectMembers, updateMemberRole, deleteMember };