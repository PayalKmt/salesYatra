function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}


function toRad(degrees) {
  return degrees * Math.PI / 180;
}

function optimizeRoute(warehouseLocation, stores) {
  if (!stores.length) return [];
  
  const optimizedRoute = [];
  let remainingStores = [...stores];
  let currentLocation = warehouseLocation;

  while (remainingStores.length > 0) {
    let nearestStore = null;
    let minDistance = Infinity;

    // Find nearest store to current location
    for (const store of remainingStores) {
      const distance = calculateDistance(currentLocation, store.location);
      if (distance < minDistance) {
        minDistance = distance;
        nearestStore = store;
      }
    }

    if (nearestStore) {
      optimizedRoute.push({
        storeId: nearestStore.id || nearestStore.storeId,
        storeName: nearestStore.storeName,
        address: nearestStore.address,
        location: nearestStore.location,
        orders: nearestStore.orders,
        distanceFromPrevious: minDistance,
        estimatedArrivalTime: calculateArrivalTime(minDistance),
        completed: false
      });
      
      currentLocation = nearestStore.location;
      remainingStores = remainingStores.filter(s => 
        s.id !== nearestStore.id && s.storeId !== nearestStore.storeId
      );
    }
  }

  return optimizedRoute;
}

function calculateArrivalTime(distance) {
  const averageSpeed = 30; // km/h
  const hours = distance / averageSpeed;
  const now = new Date();
  now.setHours(now.getHours() + hours);
  return now.toISOString();
}

module.exports = {
  calculateDistance,
  optimizeRoute,
  toRad
};