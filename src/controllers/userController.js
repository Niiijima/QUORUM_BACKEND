import User from '../../models/User.js';

// getMyProfile
export const getMyProfile = async (req, res) => {
    try {
        // Find user by ID, excluding the password field for security
        const user = await User.findById(req.user.id).select('-password');

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.username, // Match your schema field
                email: user.email,
                walletBalance: user.walletBalance || 0 // Accessed directly from the User document
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        // Since we moved the wallet data INTO the user document, 
        // we only need to delete the user document. 
        // No transaction required!
        const deletedUser = await User.findByIdAndDelete(req.user.id);
        
        if (!deletedUser) return res.status(404).json({ message: "User not found" });

        res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Error deleting account" });
    }
};