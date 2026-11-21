import * as Location from 'expo-location';

export async function getCityLocation() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    return { granted: false, city: null, region: null, coordinates: null, message: 'Location access is off. Turn it on to see style spots near you.' };
  }
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  let city = null;
  let region = null;
  try {
    const addresses = await Location.reverseGeocodeAsync({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    city = addresses[0]?.city || addresses[0]?.district || addresses[0]?.subregion || null;
    region = addresses[0]?.region || addresses[0]?.country || null;
  } catch (_error) {
    city = null;
  }
  return { granted: true, city, region, coordinates: position.coords, message: null };
}
