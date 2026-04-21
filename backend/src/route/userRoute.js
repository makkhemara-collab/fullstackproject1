const { GetUser, Create, GetOne, login, Update, Delete, sendOTP, verifyOtp, resetPassword, updateProfilePicture } = require('../controllers/userController'); // 👈 Add updateProfilePicture
const { validate_token, requireRole } = require('../middleware/auth'); 
const { uploadPhoto } = require('../middleware/upload'); // 👈 Import your tank-like middleware

const Users = (app) => {
    
    // 🔒 RESTRICTED (Admin & Manager only)
    app.get('/api/user', validate_token(), requireRole('admin', 'manager'), GetUser);
    app.post('/api/user', validate_token(), requireRole('admin', 'manager'), Create);
    app.put('/api/user', validate_token(), requireRole('admin', 'manager'), Update);
    app.delete('/api/user/:id', validate_token(), requireRole('admin'), Delete);

    // 🔓 STANDARD (Anyone logged in)
    app.get('/api/user/:id', validate_token(), GetOne);
    
    // 📸 NEW: Upload Profile Picture
    // We pass uploadPhoto first to save the file, then updateProfilePicture to save the name to DB
    app.put('/api/user/upload-photo/:id', validate_token(), uploadPhoto, updateProfilePicture);
    
    // 🌍 PUBLIC
    app.post('/api/user/login', login);
    app.post('/api/user/sendOTP', sendOTP);
    app.post('/api/user/verifyOTP', verifyOtp);
    app.post('/api/user/resetPassword', resetPassword);
}

module.exports = Users;