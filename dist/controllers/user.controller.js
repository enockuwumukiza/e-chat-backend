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
exports.getUsersWhoAddedMe = exports.removeContact = exports.getContacts = exports.addContact = exports.searchUsers = exports.getAllUsers = exports.getUserById = exports.logoutUser = exports.deleteUser = exports.updateUserProfile = exports.updateUser = exports.loginUser = exports.registerUser = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_model_1 = require("../models/user.model");
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const generateToken_1 = require("../utils/generateToken");
const bcrypt_1 = __importDefault(require("bcrypt"));
const socket_1 = require("../socket/socket");
const group_model_1 = require("../models/group.model");
const sendMail_1 = require("../utils/sendMail");
// Register user
const registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = (0, user_model_1.validateUser)(req.body);
    if (error) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: error.details[0].message });
        return;
    }
    const { name, email, password, phone, isAdmin } = req.body;
    if (!name || !email || !password || !phone) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({
            message: "Missing required fields.",
        });
        return;
    }
    const existingUser = yield user_model_1.User.findOne({ email });
    const existingPhone = yield user_model_1.User.findOne({ phone });
    if (existingUser) {
        res.status(httpStatusCodes_1.HttpStatusCodes.CONFLICT).json({ message: "Email is already in use!" });
        return;
    }
    if (existingPhone) {
        res.status(httpStatusCodes_1.HttpStatusCodes.CONFLICT).json({ message: "Phone number is already in use!" });
        return;
    }
    const user = new user_model_1.User({ name, email, password, phone, isAdmin });
    if (req.file) {
        try {
            // Wrapping the upload_stream in a Promise
            const uploadToCloudinary = (fileBuffer) => new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.default.v2.uploader.upload_stream({
                    resource_type: "image",
                    folder: "user_files",
                }, (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve((result === null || result === void 0 ? void 0 : result.secure_url) || "");
                });
                uploadStream.end(fileBuffer);
            });
            // Call the function and set the profilePicture
            user.profilePicture = yield uploadToCloudinary(req.file.buffer);
        }
        catch (error) {
            res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to upload profile picture",
                error,
            });
            return;
        }
    }
    yield user.save();
    (0, generateToken_1.generateToken)(user, res);
    res.status(httpStatusCodes_1.HttpStatusCodes.CREATED).json({ user });
    yield (0, sendMail_1.sendEmail)(user === null || user === void 0 ? void 0 : user.email, 'https://mybank-tbl5.onrender.com', 'Enock UWUMUKIZA');
}));
exports.registerUser = registerUser;
const getAllUsers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const users = yield user_model_1.User.find({ _id: { $ne: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id } }).select('-password');
    if (!users || users.length === 0) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({
            message: 'no users found.'
        });
        return;
    }
    res.json({ users });
}));
exports.getAllUsers = getAllUsers;
const searchUsers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const keyword = req.query.search ?
        {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { phone: { $regex: req.query.search, $options: 'i' } }
            ]
        }
        : {};
    const users = yield user_model_1.User.find(keyword).find({ _id: { $ne: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id } });
    if (!users) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({
            message: 'no users found.'
        });
        return;
    }
    res.json({ users });
}));
exports.searchUsers = searchUsers;
// Update user
const updateUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    const user = yield user_model_1.User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!user) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: `User with ID ${id} not found` });
        return;
    }
    res.json({ user });
}));
exports.updateUser = updateUser;
const updateUserProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const id = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: `User with ID ${id} not found` });
        return; // Stop execution after sending response
    }
    user.name = ((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.name) || (user === null || user === void 0 ? void 0 : user.name);
    user.email = ((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.email) || (user === null || user === void 0 ? void 0 : user.email);
    user.phone = ((_d = req === null || req === void 0 ? void 0 : req.body) === null || _d === void 0 ? void 0 : _d.phone) || (user === null || user === void 0 ? void 0 : user.phone);
    user.status = ((_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.status) || (user === null || user === void 0 ? void 0 : user.status);
    if (req.file) {
        try {
            const uploadToCloudinary = (fileBuffer) => new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.default.v2.uploader.upload_stream({
                    resource_type: "image",
                    folder: "user_files",
                }, (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve((result === null || result === void 0 ? void 0 : result.secure_url) || "");
                });
                uploadStream.end(fileBuffer);
            });
            // Ensure `profilePicture` is only updated if upload succeeds
            const imageUrl = yield uploadToCloudinary(req.file.buffer);
            if (imageUrl) {
                user.profilePicture = imageUrl;
            }
        }
        catch (error) {
            res.status(httpStatusCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Failed to update profile picture",
                error,
            });
            return;
        }
    }
    yield user.save();
    (0, generateToken_1.generateToken)(user, res);
    res.json({ user });
}));
exports.updateUserProfile = updateUserProfile;
const getUserById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_model_1.User.findByIdAndDelete(id);
    if (!user) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({
            message: `user with ID ${id} was not found.`
        });
        return;
    }
    res.json({ user });
}));
exports.getUserById = getUserById;
// Delete user
const deleteUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_model_1.User.findByIdAndDelete(id);
    if (!user) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: `User with ID ${id} not found` });
        return;
    }
    res.json({ message: `User ${user.name} deleted successfully` });
}));
exports.deleteUser = deleteUser;
// Login user
const loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: "Email and password are required" });
        return;
    }
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: `email: ${email} was not found. consider signing up` });
        return;
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
        return;
    }
    (0, generateToken_1.generateToken)(user, res);
    const userId = user === null || user === void 0 ? void 0 : user._id;
    if (!userId) {
        res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: 'user is not authenticated'
        });
        return;
    }
    const groups = yield group_model_1.Group.find({ "members.userId": userId });
    if (userId) {
        const userSocketId = (0, socket_1.getReceiverSocketId)(user === null || user === void 0 ? void 0 : user._id);
        if (userSocketId && groups && groups.length > 0) {
            groups.forEach((group) => {
                socket_1.io.to(userSocketId).emit("group-created", { groupName: group.name });
                const socket = socket_1.io.sockets.sockets.get(userSocketId);
                if (socket) {
                    socket.join(group === null || group === void 0 ? void 0 : group._id);
                }
            });
        }
    }
    res.json({ user });
}));
exports.loginUser = loginUser;
// Logout user
const logoutUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookieOptions = {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 0, // Clear cookie
        secure: process.env.NODE_ENV === "production",
    };
    res.clearCookie("accessToken", cookieOptions);
    res.json({ message: 'logged out successfully' });
}));
exports.logoutUser = logoutUser;
const addContact = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { contactNames } = req.body;
    if (!contactNames || contactNames.length === 0) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: "Invalid contacts" });
        return;
    }
    if (!req.user || !req.user._id) {
        res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({ message: "Unauthorized: Login to continue" });
        return;
    }
    // Fetch the logged-in user
    const loggedInUser = yield user_model_1.User.findById(req.user._id);
    if (!loggedInUser) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ error: "User not found" });
        return;
    }
    const foundContacts = yield user_model_1.User.find({ name: { $in: contactNames } }, "_id");
    if (foundContacts.length === 0) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: "No valid contacts found." });
        return;
    }
    // Add contacts while avoiding duplicates
    const newContactIds = foundContacts.map((user) => user._id);
    // Ensure loggedInUser.contacts is an array before spreading it
    loggedInUser.contacts = [
        ...new Set([...((_a = loggedInUser.contacts) !== null && _a !== void 0 ? _a : []), ...newContactIds]),
    ];
    yield loggedInUser.save();
    // Populate contacts before sending response
    const updatedUser = yield loggedInUser.populate("contacts");
    res.status(httpStatusCodes_1.HttpStatusCodes.OK).json({ contacts: updatedUser.contacts });
}));
exports.addContact = addContact;
const getContacts = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.user || !req.user._id) {
        res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({ error: "Unauthorized: Login to continue" });
        return;
    }
    const user = yield user_model_1.User.findById((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id).populate('contacts');
    res.json({ contacts: user === null || user === void 0 ? void 0 : user.contacts });
}));
exports.getContacts = getContacts;
const removeContact = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { contactId } = req.params;
    if (!contactId) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: "Invalid contact ID" });
        return;
    }
    if (!req.user || !req.user._id) {
        res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({ message: "Unauthorized: Login to continue" });
        return;
    }
    // Fetch the logged-in user
    const loggedInUser = yield user_model_1.User.findById(req.user._id);
    if (!loggedInUser) {
        res.status(httpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ message: "User not found" });
        return;
    }
    if (!Array.isArray(loggedInUser.contacts)) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: "Contacts data is not available" });
        return;
    }
    // Find index of the contact
    const contactIndex = loggedInUser.contacts.findIndex((c) => c.equals(contactId));
    if (contactIndex === -1) {
        res.status(httpStatusCodes_1.HttpStatusCodes.BAD_REQUEST).json({ message: "This contact added you OR You are not associated with that contact ID" });
        return;
    }
    // Remove the contact
    loggedInUser.contacts.splice(contactIndex, 1);
    yield loggedInUser.save();
    res.status(httpStatusCodes_1.HttpStatusCodes.OK).json({ message: "Contact removed successfully", contacts: loggedInUser.contacts });
}));
exports.removeContact = removeContact;
const getUsersWhoAddedMe = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!(req === null || req === void 0 ? void 0 : req.user) || !((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({ message: "Unauthorized: Login to continue" });
        return;
    }
    const userId = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b._id;
    const users = yield user_model_1.User.find({ contacts: userId }).select('-password');
    res.status(httpStatusCodes_1.HttpStatusCodes.OK).json({ users });
}));
exports.getUsersWhoAddedMe = getUsersWhoAddedMe;
