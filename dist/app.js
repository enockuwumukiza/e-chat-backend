"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.PORT = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_routes_1 = require("./routes/user.routes");
const group_routes_1 = require("./routes/group.routes");
const message_routes_1 = require("./routes/message.routes");
const socket_1 = require("./socket/socket");
Object.defineProperty(exports, "app", { enumerable: true, get: function () { return socket_1.app; } });
Object.defineProperty(exports, "server", { enumerable: true, get: function () { return socket_1.server; } });
const corsConfig_1 = require("./config/corsConfig");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
//built-in middlewares
socket_1.app.use(express_1.default.json());
socket_1.app.use(express_1.default.urlencoded({ extended: true }));
socket_1.app.use(express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'eChat', 'dist')));
//custom middlewares
socket_1.app.use((0, cors_1.default)(corsConfig_1.corsConfig));
socket_1.app.use((0, cookie_parser_1.default)());
const PORT = process.env.PORT || 5000;
exports.PORT = PORT;
socket_1.app.use('/api/users', user_routes_1.userRoutes);
socket_1.app.use('/api/groups', group_routes_1.groupRoutes);
socket_1.app.use('/api/messages', message_routes_1.messageRoutes);
socket_1.app.use(express_1.default.static(path_1.default.join(__dirname, '..', '..', 'frontend', 'eChat', 'dist')));
socket_1.app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', '..', 'frontend', 'eChat', 'dist', 'index.html'));
});
