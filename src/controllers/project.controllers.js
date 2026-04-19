import { User } from "../modles/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../modles/project.models.js";
import { ProjectMember } from "../modles/projectmember.models.js";
import mongoose from "mongoose";
const getProjects= asyncHandler(async (req, res) => {

});

const getProjectById= asyncHandler(async (req, res) => {

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

const addMemberToProject= asyncHandler(async (req, res) => {

});

const getProjectMembers= asyncHandler(async (req, res) => {

});

const updateMemberRole= asyncHandler(async (req, res) => {

});
const deleteMember=asyncHandler(async (req, res) => {

});
export { getProjects, getProjectById, createProject, updateProject, deleteProject,addMemberToProject, getProjectMembers, updateMemberRole, deleteMember };