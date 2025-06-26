const storeService = require('../services/storeService.js');
const { StatusCodes } = require('http-status-codes');

const createStore = async(req,res) => {
    try {
        const store = await storeService.createStore(req.body);
        res.status(StatusCodes.CREATED).json(store);

    } catch (error) {
        console.log("store is not created");
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });

    }
}

module.exports = {
    createStore
};