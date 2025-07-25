"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupRoutes = void 0;
const express_1 = __importDefault(require("express"));
const group_controller_1 = require("../controllers/group.controller");
const VerifyToken_1 = require("../middlewares/VerifyToken");
const groupRoutes = express_1.default.Router();
exports.groupRoutes = groupRoutes;
groupRoutes.post('/', VerifyToken_1.verifyToken, group_controller_1.createGroup);
groupRoutes.get('/', VerifyToken_1.verifyToken, group_controller_1.getGroups);
groupRoutes.post('/add/:groupId', VerifyToken_1.verifyToken, group_controller_1.addMemberToGroup);
groupRoutes.get('/members/:groupId', VerifyToken_1.verifyToken, group_controller_1.getGroupMembers);
groupRoutes.get('/messages/:groupId', VerifyToken_1.verifyToken, group_controller_1.getGroupMessages);
groupRoutes.post('/remove/:groupId', VerifyToken_1.verifyToken, group_controller_1.removeMemberFromGroup);
groupRoutes.get('/:groupId', VerifyToken_1.verifyToken, group_controller_1.getGroupById);
