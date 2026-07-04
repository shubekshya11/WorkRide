/**
 * Polyline encoding/decoding utilities (compatible with OSRM route geometry).
 * 
 * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Decodes an encoded polyline string into an array of LatLng coordinates.
 * 
 * @param encoded The encoded polyline string
 * @returns Array of LatLng coordinates
 * 
 * @example
 * const points = decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
 */
export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

/**
 * Encodes an array of LatLng coordinates into a polyline string.
 * 
 * @param points Array of LatLng coordinates
 * @returns Encoded polyline string
 * 
 * @example
 * const encoded = encodePolyline([{lat: 38.5, lng: -120.2}, {lat: 40.7, lng: -120.95}]);
 */
export function encodePolyline(points: LatLng[]): string {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const point of points) {
    const lat = Math.round(point.lat * 1e5);
    const lng = Math.round(point.lng * 1e5);

    encoded += encodeValue(lat - prevLat);
    encoded += encodeValue(lng - prevLng);

    prevLat = lat;
    prevLng = lng;
  }

  return encoded;
}

/**
 * Encodes a single value using the polyline encoding algorithm.
 */
function encodeValue(value: number): string {
  let encoded = '';
  let delta = value < 0 ? ~(value << 1) : value << 1;

  while (delta >= 0x20) {
    encoded += String.fromCharCode((0x20 | (delta & 0x1f)) + 63);
    delta >>= 5;
  }

  encoded += String.fromCharCode(delta + 63);
  return encoded;
}

/**
 * Calculates the total distance along a polyline path in kilometers.
 * 
 * @param points Array of LatLng coordinates
 * @returns Total distance in kilometers
 */
export function calculatePolylineDistance(points: LatLng[]): number {
  if (points.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += haversineDistance(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng,
    );
  }

  return totalDistance;
}

/**
 * Haversine distance calculation for polyline distance calculation.
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Simplifies a polyline using the Douglas-Peucker algorithm.
 * This reduces the number of points while maintaining the general shape.
 * 
 * @param points Array of LatLng coordinates
 * @param tolerance Maximum distance deviation in kilometers
 * @returns Simplified array of LatLng coordinates
 */
export function simplifyPolyline(points: LatLng[], tolerance: number = 0.001): LatLng[] {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let maxIndex = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[end]);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > tolerance) {
    const left = simplifyPolyline(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyPolyline(points.slice(maxIndex), tolerance);
    return left.slice(0, -1).concat(right);
  }

  return [points[0], points[end]];
}

/**
 * Calculates the perpendicular distance from a point to a line segment.
 */
function perpendicularDistance(point: LatLng, lineStart: LatLng, lineEnd: LatLng): number {
  if (lineStart.lat === lineEnd.lat && lineStart.lng === lineEnd.lng) {
    return haversineDistance(point.lat, point.lng, lineStart.lat, lineStart.lng);
  }

  const x = lineStart.lat;
  const y = lineStart.lng;
  const dx = lineEnd.lat - x;
  const dy = lineEnd.lng - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((point.lat - x) * dx + (point.lng - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      return haversineDistance(point.lat, point.lng, lineEnd.lat, lineEnd.lng);
    } else if (t < 0) {
      return haversineDistance(point.lat, point.lng, lineStart.lat, lineStart.lng);
    } else {
      const nearestX = x + t * dx;
      const nearestY = y + t * dy;
      return haversineDistance(point.lat, point.lng, nearestX, nearestY);
    }
  }

  return haversineDistance(point.lat, point.lng, lineStart.lat, lineStart.lng);
}
