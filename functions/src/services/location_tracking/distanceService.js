const haversine = require('haversine');
const admin = require('firebase-admin');
const db = admin.firestore();

async function getStoreDistancesFromAgent(deliveryAgentProfileId) {
  try {
    const agentDoc = await db.collection('deliveryAgentProfile').doc(deliveryAgentProfileId).get();
    if (!agentDoc.exists) {
      throw new Error('Agent not found');
    }

    const agentLocation = agentDoc.data().currentLocation;

    const storeSnapshot = await db.collection('stores').get();
    const storeDistances = [];

    storeSnapshot.forEach(doc => {
      const store = doc.data();
      const storeLocation = store.location;

      const distance = haversine(agentLocation, storeLocation, { unit: 'km' });

      storeDistances.push({
        storeId: doc.id,
        storeName: store.storeName,
        distance: parseFloat(distance.toFixed(2))
      });
    });

    // Optional: sort by nearest store
    storeDistances.sort((a, b) => a.distance - b.distance);

    return storeDistances;
  } catch (error) {
    console.error('Error calculating distances:', error.message);
    throw error;
  }
}

module.exports = getStoreDistancesFromAgent;
