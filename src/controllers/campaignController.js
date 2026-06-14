import Campaign from '../models/Campaign.js';

export const createCampaign = async (req, res) => {
    try {
        const { title, description, categories } = req.body;

        // Note: req.user.id is assumed to be available from your auth middleware
        const newCampaign = await Campaign.create({
            title,
            description,
            creator: req.user.id, 
            categories 
        });

        return res.status(201).json({ success: true, data: newCampaign });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

export const deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCampaign = await Campaign.findByIdAndDelete(id);

        if (!deletedCampaign) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }

        return res.status(200).json({ success: true, message: "Campaign deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { createCampaign, deleteCampaign };