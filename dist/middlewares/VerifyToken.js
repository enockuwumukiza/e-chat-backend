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
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const user_model_1 = require("../models/user.model");
dotenv_1.default.config();
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken; // Ensure cookies exist
        if (!token) {
            return res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
                message: 'Unauthorized -- Access Denied',
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield user_model_1.User.findById(decoded._id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
                message: "User not found -- Access Denied",
            });
        }
        // Attach the user to the request object
        req.user = user;
        next();
    }
    catch (error) {
        console.error(`Invalid token: ${error}`);
        return res.status(httpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: 'Invalid or expired token -- please log in and try again.',
        });
    }
});
exports.verifyToken = verifyToken;
