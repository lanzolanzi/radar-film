export interface SonarTarget {
  id: string;
  lat: number;
  lng: number;
  type: 'submarine' | 'anomaly' | 'school_of_fish' | 'wreck';
  angle: number; // 0 to 360, 0 is North
  distance: number;
  radius: number;
}

export function generateSonarTargets(centerLat: number, centerLng: number, maxRadiusMeters: number, count: number): SonarTarget[] {
  const targets: SonarTarget[] = [];
  const types: SonarTarget['type'][] = ['submarine', 'anomaly', 'school_of_fish', 'wreck'];
  
  // 1 degree of latitude is ~111,320 meters
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 40075000 * Math.cos(centerLat * Math.PI / 180) / 360;

  for (let i = 0; i < count; i++) {
    const angleRad = Math.random() * Math.PI * 2;
    // Keep most targets within a certain radius, maybe weighted towards center
    const r = Math.random() * maxRadiusMeters;
    
    const latOffset = (Math.cos(angleRad) * r) / metersPerDegreeLat;
    const lngOffset = (Math.sin(angleRad) * r) / metersPerDegreeLng;
    
    // Angle in degrees from North (0)
    let degrees = (angleRad * 180 / Math.PI);
    if (degrees < 0) degrees += 360;

    targets.push({
      id: `tgt-${i}-${Math.floor(Math.random()*1000)}`,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
      type: types[Math.floor(Math.random() * types.length)],
      angle: degrees,
      distance: r,
      radius: Math.random() * 8 + 4 // size of the blip
    });
  }
  
  // Sort targets by angle so we can reveal them as radar sweeps
  return targets.sort((a, b) => a.angle - b.angle);
}
