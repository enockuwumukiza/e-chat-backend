"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateToken = (user, res) => {
    try {
        // Generate the JWT token
        const token = jsonwebtoken_1.default.sign({
            _id: user._id,
            name: user.name,
            email: user.email
        }, process.env.JWT_SECRET, {
            expiresIn: '7d', // Token validity
            algorithm: 'HS256', // Strong HMAC algorithm
        });
        // Set the token as a secure cookie
        res.cookie('accessToken', token, {
            httpOnly: true, // Prevent JavaScript access
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            sameSite: 'strict', // CSRF protection
        });
        return token;
    }
    catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Token generation failed');
    }
};
exports.generateToken = generateToken;
