const storeService = require('../services/storeService');
const { StatusCodes } = require('http-status-codes');

const createStore = async (req, res) => {
    try {
        const store = await storeService.createStore(req.body);
        res.status(StatusCodes.CREATED).json({
            success: true,
            data: store,
            message: 'Store created successfully'
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: error.message,
            message: 'Failed to create store'
        });
    }
};

const getStoreById = async (req, res) => {
    try {
        const store = await storeService.getStore(req.params.storeId);
        if (!store) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Store not found'
            });
        }
        res.status(StatusCodes.OK).json({
            success: true,
            data: store
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message,
            message: 'Failed to fetch store'
        });
    }
};

const updateStoreData = async (req, res) => {
    try {
        const updatedStore = await storeService.updateStore(
            req.params.storeId,
            req.body
        );
        res.status(StatusCodes.OK).json({
            success: true,
            data: updatedStore,
            message: 'Store updated successfully'
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') 
            ? StatusCodes.NOT_FOUND 
            : StatusCodes.BAD_REQUEST;
        res.status(statusCode).json({
            success: false,
            error: error.message,
            message: 'Failed to update store'
        });
    }
};

const deleteStoreById = async (req, res) => {
    try {
        await storeService.deleteStore(req.params.storeId);
        res.status(StatusCodes.NO_CONTENT).end();
    } catch (error) {
        const statusCode = error.message.includes('not found') 
            ? StatusCodes.NOT_FOUND 
            : StatusCodes.BAD_REQUEST;
        res.status(statusCode).json({
            success: false,
            error: error.message,
            message: 'Failed to delete store'
        });
    }
};

module.exports = {
    createStore,
    getStoreById,
    updateStoreData,
    deleteStoreById
};