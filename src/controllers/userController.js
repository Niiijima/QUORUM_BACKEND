const prisma = require('../lib/prisma');

// getMyProfile
const getMyProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { wallet: true }
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                walletBalance: user.wallet?.balance || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const deleteAccount = async (req, res) => {
    try {
        await prisma.wallet.deleteMany({ where: { userId: req.user.userId } });
        await prisma.user.delete({ where: { id: req.user.userId } });
        res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting account" });
    }
};

// Placeholder for deleteUser 
const deleteUser = async (req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
};

module.exports = { getMyProfile, deleteAccount, deleteUser };