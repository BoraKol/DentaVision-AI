const User = require('../models/User');
const generateToken = require('../utils/generateToken');

class AuthService {
    async register(data) {
        const { email, password, name, title, specialty, clinicName } = data;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new Error('User already exists');
        }

        // Create user
        const user = await User.create({
            email,
            password,
            name,
            title: title || 'Dt.',
            specialty: specialty || 'General Dentist',
            clinicName: clinicName || 'DentaVision Clinic'
        });

        if (user) {
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                title: user.title,
                specialty: user.specialty,
                clinicName: user.clinicName,
                role: user.role,
                preferences: user.preferences,
                token: generateToken(user._id)
            };
        }
    }

    async login(email, password) {
        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                title: user.title,
                specialty: user.specialty,
                clinicName: user.clinicName,
                role: user.role,
                avatar: user.avatar,
                preferences: user.preferences,
                token: generateToken(user._id)
            };
        } else {
            throw new Error('Invalid email or password');
        }
    }

    async getMe(userId) {
        return await User.findById(userId).select('-password');
    }

    async updateProfile(userId, data) {
        const user = await User.findById(userId);

        if (user) {
            user.name = data.name || user.name;
            user.title = data.title || user.title;
            user.specialty = data.specialty || user.specialty;
            user.clinicName = data.clinicName || user.clinicName;
            user.avatar = data.avatar || user.avatar;
            
            if (data.preferences) {
                user.preferences = { ...user.preferences, ...data.preferences };
            }

            if (data.password) {
                user.password = data.password;
            }

            const updatedUser = await user.save();

            return {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                title: updatedUser.title,
                specialty: updatedUser.specialty,
                clinicName: updatedUser.clinicName,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                preferences: updatedUser.preferences
            };
        } else {
            throw new Error('User not found');
        }
    }
}

module.exports = new AuthService();
