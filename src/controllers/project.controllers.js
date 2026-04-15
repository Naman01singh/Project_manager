import { User } from "../modles/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../modles/project.models.js";
import { ProjectMember } from "../modles/projectmember.models.js";

const getProjects= asyncHandler(async (req, res) => {

});

const getProjectById= asyncHandler(async (req, res) => {

});

const createProject= asyncHandler(async (req, res) => {

});

const updateProject= asyncHandler(async (req, res) => {

});

const deleteProject= asyncHandler(async (req, res) => {

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