"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupMessages = exports.getGroupMembers = exports.getGroupById = exports.getGroups = exports.removeMemberFromGroup = exports.addMemberToGroup = exports.createGroup = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const group_model_1 = require("../models/group.model");
const socket_1 = require("../socket/socket");
const user_model_1 = require("../models/user.model");
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const createGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, memberNames } = req.body;
    if (!name || !Array.isArray(memberNames) || memberNames.length === 0) {
        res.status(400).json({ error: "Invalid group data" });
        return;
    }
    const existingGroup = yield group_model_1.Group.findOne({ name });
    if (existingGroup) {
        res.status(409).json({ message: `Group ${name} already exists!` });
        return;
    }
    try {
        const members = [];
        if (!req.user || !req.user._id) {
            res.status(401).json({ error: "Unauthorized: No user data available" });
            return;
        }
        // Add the user who created the group as admin
        members.push({ userId: req.user._id, role: 'admin' });
        // Add other members to the group
        for (const memberName of memberNames) {
            const user = yield user_model_1.User.findOne({ name: memberName });
            if (!user) {
                res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: `User ${memberName} not found.` });
                continue;
            }
            members.push({ userId: user._id, role: "member" });
        }
        if (members.length === 0) {
            res.status(400).json({ error: "No valid members found for the group" });
            return;
        }
        // Create the group with the members
        const newGroup = new group_model_1.Group({
            name,
            members,
            groupAdmin: req.user._id,
        });
        yield newGroup.save();
        const membersOfGroup = newGroup === null || newGroup === void 0 ? void 0 : newGroup.members;
        for (const member of membersOfGroup) {
            const memberSocket = socket_1.io.sockets.sockets.get((0, socket_1.getReceiverSocketId)(member === null || member === void 0 ? void 0 : member.userId));
            if (memberSocket) {
                memberSocket.join(newGroup === null || newGroup === void 0 ? void 0 : newGroup._id);
                const memberFound = yield user_model_1.User.findById(member === null || member === void 0 ? void 0 : member.userId).exec();
                socket_1.io.to(newGroup === null || newGroup === void 0 ? void 0 : newGroup._id).emit('member-joined', `${memberFound === null || memberFound === void 0 ? void 0 : memberFound.name} has joined ${newGroup === null || newGroup === void 0 ? void 0 : newGroup.name}`);
            }
        }
        res.status(201).json({ newGroup });
    }
    catch (error) {
        res.status(500).json({ error: "An error occurred while creating the group" });
    }
}));
exports.createGroup = createGroup;
const getGroups = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    try {
        // Fetch groups where the user is a member
        const groups = yield group_model_1.Group.find({ "members.userId": userId });
        if (!groups.length) {
            res.status(404).json({ message: 'No groups found for this user' });
            return;
        }
        res.json({ groups });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
}));
exports.getGroups = getGroups;
const getGroupMembers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const groupMembers = yield group_model_1.Group.findById(groupId).populate({
        path: 'members.userId'
    }).populate('groupAdmin');
    if (!groupMembers) {
        res.status(404).json({ message: `group and group members were not found` });
        return;
    }
    res.json({ groupMembers });
}));
exports.getGroupMembers = getGroupMembers;
const getGroupMessages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    try {
        const groupMessages = yield group_model_1.Group.findById(groupId)
            .populate({
            path: 'messages',
            populate: { path: 'sender', model: 'User' },
        })
            .populate('latestMessage')
            .populate('groupAdmin');
        if (!groupMessages) {
            res.status(404).json({ message: `Group not found` });
            return;
        }
        const messages = groupMessages === null || groupMessages === void 0 ? void 0 : groupMessages.messages;
        res.json({ messages });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred while retrieving group messages" });
    }
}));
exports.getGroupMessages = getGroupMessages;
const getGroupById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const group = yield group_model_1.Group.findById(groupId).populate('members.userId').populate('groupAdmin');
    if (!group) {
        res.status(404).json({ message: `group was not found` });
        return;
    }
    res.json({ group });
}));
exports.getGroupById = getGroupById;
const addMemberToGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { memberName } = req.body;
    try {
        const group = yield group_model_1.Group.findById(groupId).exec();
        const memberFound = group === null || group === void 0 ? void 0 : group.members.find((member) => { var _a; return member === null || member === void 0 ? void 0 : member.userId.equals((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id); });
        if ((memberFound === null || memberFound === void 0 ? void 0 : memberFound.role) !== 'admin') {
            res.status(401).json({
                message: 'Only admins can add members to group!'
            });
            return;
        }
        if (!memberName) {
            res.status(400).json({ message: 'Member name is required' });
            return;
        }
        const member = yield user_model_1.User.findOne({ name: memberName });
        if (!member || !group) {
            res.status(404).json({ message: "User or group not found" });
            return;
        }
        if (group.members.some((m) => m.userId.equals(member._id))) {
            res.status(400).json({ message: "User is already a member" });
            return;
        }
        group.members.push({ userId: member._id, role: "member" });
        yield group.save();
        const memberSocket = socket_1.io.sockets.sockets.get((0, socket_1.getReceiverSocketId)(member === null || member === void 0 ? void 0 : member._id));
        const memberSocketId = (0, socket_1.getReceiverSocketId)(member === null || member === void 0 ? void 0 : member._id);
        if (memberSocket && memberSocketId) {
            memberSocket === null || memberSocket === void 0 ? void 0 : memberSocket.join(group === null || group === void 0 ? void 0 : group._id);
            socket_1.io.to(memberSocketId).emit("group-added", { groupId, groupName: group.name });
            socket_1.io.to(group === null || group === void 0 ? void 0 : group._id).emit('member-joined', `${member.name} has joined the chat`);
        }
        res.json({ message: "Member added successfully", group });
    }
    catch (error) {
        res.status(500).json({ error: "An error occurred while adding the member" });
    }
}));
exports.addMemberToGroup = addMemberToGroup;
// Remove a member from a group
const removeMemberFromGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { memberName } = req.body;
    try {
        const group = yield group_model_1.Group.findById(groupId);
        const memberFound = group === null || group === void 0 ? void 0 : group.members.find((member) => {
            var _a;
            return (member === null || member === void 0 ? void 0 : member.userId.toString()) === ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id.toString());
        });
        if ((memberFound === null || memberFound === void 0 ? void 0 : memberFound.role) !== 'admin') {
            res.status(401).json({
                message: 'Only admins can remove members from group!'
            });
            return;
        }
        const member = yield user_model_1.User.findOne({ name: memberName });
        if (!member || !group) {
            res.status(404).json({ error: "User or group not found" });
            return;
        }
        const memberIndex = group.members.findIndex((m) => m.userId.equals(member._id));
        if (memberIndex === -1) {
            res.status(400).json({ error: "User is not a member" });
            return;
        }
        group.members.splice(memberIndex, 1);
        yield group.save();
        const memberSocket = socket_1.io.sockets.sockets.get((0, socket_1.getReceiverSocketId)(member === null || member === void 0 ? void 0 : member._id));
        const memberSocketId = (0, socket_1.getReceiverSocketId)(member === null || member === void 0 ? void 0 : member._id);
        if (memberSocket && memberSocketId) {
            memberSocket === null || memberSocket === void 0 ? void 0 : memberSocket.leave(group === null || group === void 0 ? void 0 : group._id);
            socket_1.io.to(group === null || group === void 0 ? void 0 : group._id).emit("member-left", { groupId, groupName: group.name });
        }
        res.json({ message: "Member removed successfully", group });
    }
    catch (error) {
        res.status(500).json({ error: "An error occurred while removing the member" });
    }
}));
exports.removeMemberFromGroup = removeMemberFromGroup;
