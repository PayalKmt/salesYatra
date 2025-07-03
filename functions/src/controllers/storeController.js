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

const getStoreById = async (req, res) => {
  try {
    const store = await storeService.getStore(req.body.storeId);
    res.status(StatusCodes.ACCEPTED).json(store);
  } catch (e) {
    console.log("Store Not Found !");
    res.status(StatusCodes.NOT_FOUND);
  }
};

const updateStoreData = async (req, res) => {
  try {
    const storeUpdateData = await storeService.updateStore(
      req.params.storeId,
      req.body
    );
    res.status(StatusCodes.ACCEPTED).json(storeUpdateData);
  } catch (e) {
    console.log("Store Not Found !");
    res.status(StatusCodes.BAD_REQUEST);
  }
};

const deleteStoreById = async (req, res) => {
  try {
    const storeDeleted = await storeService.deleteStore(req.params.storeId);
    res.status(StatusCodes.No_CONTENT).json(storeDeleted);
  } catch (e) {
    console.log("Store Not Found !");
    res.status(StatusCodes.BAD_REQUEST);
  }
};

module.exports = {
  createStore,
  getStoreById,
  updateStoreData,
  deleteStoreById,
};