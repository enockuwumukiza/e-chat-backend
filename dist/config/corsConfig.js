"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = void 0;
exports.corsConfig = {
    origin: ["http://localhost:3000", "https://e-chat-seven.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    optionsSuccessStatus: 200,
    credentials: true
};
