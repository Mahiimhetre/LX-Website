import { Locator } from '../models/index.js';

export const createLocator = async (req, res) => {
    try {
        const { name, selector, type, elementTag, pageUrl } = req.body;
        
        if (!name || !selector) {
            return res.status(400).json({ success: false, message: 'Name and selector are required' });
        }

        const locator = await Locator.create({
            name,
            selector,
            type: type || 'xpath',
            elementTag,
            pageUrl,
            userId: req.user.id
        });

        res.status(201).json({ success: true, locator });
    } catch (error) {
        console.error('Create locator error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getUserLocators = async (req, res) => {
    try {
        const locators = await Locator.findAll({ 
            where: { userId: req.user.id },
            order: [['updatedAt', 'DESC']]
        });
        
        res.json({ success: true, locators });
    } catch (error) {
        console.error('Get locators error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteLocator = async (req, res) => {
    try {
        const { id } = req.params;
        const locator = await Locator.findOne({ where: { id, userId: req.user.id } });
        
        if (!locator) {
            return res.status(404).json({ success: false, message: 'Locator not found' });
        }

        await locator.destroy();
        res.json({ success: true, message: 'Locator deleted successfully' });
    } catch (error) {
        console.error('Delete locator error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
