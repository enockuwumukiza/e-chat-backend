"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const app_1 = require("./app");
const dbConfig_1 = require("./config/dbConfig");
dotenv_1.default.config();
// Cloudinary configuration
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
// Start the server
app_1.server.listen(app_1.PORT, () => {
    (0, dbConfig_1.dbConnection)();
});
