const userRepository = require('../repositories/UserRepository');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');

class AuthService {
    async register(data) {
        const { email, password, name, title, specialty, clinicName } = data;

        // Check if user exists
        const userExists = await userRepository.findByEmail(email);
        if (userExists) {
            throw new AppError('User already exists', 400);
        }

        // Create user
        const user = await userRepository.create({
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
                branches: user.branches,
                activeBranch: user.activeBranch,
                token: generateToken(user._id)
            };
        }
    }

    async login(email, password) {
        // Check for user email
        const user = await userRepository.findByEmail(email);

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
                branches: user.branches,
                activeBranch: user.activeBranch,
                token: generateToken(user._id)
            };
        } else {
            throw new AppError('Invalid email or password', 401);
        }
    }

    async getMe(userId) {
        return await userRepository.findByIdWithSelect(userId);
    }

    async updateProfile(userId, data) {
        const user = await userRepository.findById(userId);

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

            // Return masked version for UI
            return {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                title: updatedUser.title,
                specialty: updatedUser.specialty,
                clinicName: updatedUser.clinicName,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                preferences: updatedUser.preferences,
                branches: updatedUser.branches,
                activeBranch: updatedUser.activeBranch,
                geminiApiKey: updatedUser.geminiApiKey 
                    ? `${updatedUser.geminiApiKey.substring(0, 8)}...****` 
                    : ''
            };
        } else {
            throw new AppError('User not found', 404);
        }
    }

    async getRawApiKey(userId) {
        const user = await userRepository.findByIdWithSelect(userId, '+geminiApiKey');
        return user ? user.geminiApiKey : '';
    }

    async updateActiveBranch(userId, branchName) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (!user.branches.includes(branchName)) {
            throw new AppError('Branch not authorized for this user', 403);
        }

        user.activeBranch = branchName;
        await user.save();
        return user;
    }
}

module.exports = new AuthService();
