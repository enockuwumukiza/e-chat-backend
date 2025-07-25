"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const VerifyToken_1 = require("../middlewares/VerifyToken");
const user_controller_1 = require("../controllers/user.controller");
const uploader_1 = require("../middlewares/uploader");
const userRoutes = express_1.default.Router();
exports.userRoutes = userRoutes;
userRoutes.route('/')
    .get(VerifyToken_1.verifyToken, user_controller_1.getAllUsers)
    .post(uploader_1.uploader, user_controller_1.registerUser);
userRoutes.post('/addContacts', VerifyToken_1.verifyToken, user_controller_1.addContact);
userRoutes.get('/getContacts', VerifyToken_1.verifyToken, user_controller_1.getContacts);
userRoutes.get('/getContactsMe', VerifyToken_1.verifyToken, user_controller_1.getUsersWhoAddedMe);
userRoutes.post('/login', user_controller_1.loginUser);
userRoutes.post('/logout', user_controller_1.logoutUser);
userRoutes.get('/search', VerifyToken_1.verifyToken, user_controller_1.searchUsers);
userRoutes.put('/update', VerifyToken_1.verifyToken, uploader_1.uploader, user_controller_1.updateUserProfile);
userRoutes.post('/removeContact/:contactId', VerifyToken_1.verifyToken, user_controller_1.removeContact);
userRoutes.route('/:id')
    .get(VerifyToken_1.verifyToken, user_controller_1.getUserById)
    .put(VerifyToken_1.verifyToken, user_controller_1.updateUser)
    .delete(VerifyToken_1.verifyToken, user_controller_1.deleteUser);
