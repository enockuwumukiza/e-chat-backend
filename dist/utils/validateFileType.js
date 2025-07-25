"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidFileType = isValidFileType;
const ALLOWED_FILE_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    video: ['video/mp4', 'video/avi', 'video/mkv'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
    file: [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
};
function isValidFileType(fileType, mimeType) {
    var _a;
    return ((_a = ALLOWED_FILE_TYPES[fileType]) === null || _a === void 0 ? void 0 : _a.includes(mimeType)) || false;
}
