const getStoreDistancesFromAgent = require('../../services/location_tracking/distanceService')

const getNearestStores = async (req, res) => {
  try {
    const distances = await getStoreDistancesFromAgent(req.params.deliveryAgentProfileId);
    res.json(distances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = getNearestStores;


