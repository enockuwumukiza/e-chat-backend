import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IUser } from '../models/user.model';

dotenv.config();

export const generateToken = (user: IUser): string => {
    try {
        // Generate the JWT token
        const token = jwt.sign(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: '7d', // Token validity
                algorithm: 'HS256', // Strong HMAC algorithm
            }
        );

        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Token generation failed');
    }
};
