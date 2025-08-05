"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateToken = (user) => {
    try {
        // Generate the JWT token
        const token = jsonwebtoken_1.default.sign({
            _id: user._id,
            name: user.name,
            email: user.email,
        }, process.env.JWT_SECRET, {
            expiresIn: '7d', // Token validity
            algorithm: 'HS256', // Strong HMAC algorithm
        });
        return token;
    }
    catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Token generation failed');
    }
};
exports.generateToken = generateToken;
