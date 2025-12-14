// Lagjet e qytetit të Elbasanit
export const neighborhoods = [
  { name: "Lagja 5 Maji", lat: 41.1128, lng: 20.0892 },
  { name: "Lagja 28 Nëntori", lat: 41.1145, lng: 20.0823 },
  { name: "Lagja Kala", lat: 41.1098, lng: 20.0789 },
  { name: "Lagja Luigj Gurakuqi", lat: 41.1189, lng: 20.0901 },
  { name: "Lagja Partizani", lat: 41.1167, lng: 20.0756 },
  { name: "Lagja Skënderbeu", lat: 41.1112, lng: 20.0934 },
  { name: "Lagja 11 Nëntori", lat: 41.1078, lng: 20.0867 },
  { name: "Lagja Republika", lat: 41.1201, lng: 20.0812 },
  { name: "Lagja Kongresi i Elbasanit", lat: 41.1156, lng: 20.0878 },
  { name: "Lagja Aqif Pasha", lat: 41.1089, lng: 20.0945 },
  { name: "Lagja Dyli Haxhire", lat: 41.1234, lng: 20.0789 },
  { name: "Lagja Shën Koll", lat: 41.1045, lng: 20.0823 },
  { name: "Lagja Sopotit", lat: 41.0989, lng: 20.0901 },
  { name: "Lagja Shirgjan", lat: 41.0912, lng: 20.0756 },
  { name: "Lagja Bradashesh", lat: 41.1312, lng: 20.1023 },
];

export const getNeighborhoodByCoordinates = (lat: number, lng: number): string => {
  let closestNeighborhood = neighborhoods[0].name;
  let minDistance = Infinity;
  
  for (const neighborhood of neighborhoods) {
    const distance = Math.sqrt(
      Math.pow(lat - neighborhood.lat, 2) + Math.pow(lng - neighborhood.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestNeighborhood = neighborhood.name;
    }
  }
  
  return closestNeighborhood;
};

// Damage estimates per neighborhood (in EUR) - for demonstration
export const neighborhoodDamageEstimates: Record<string, number> = {
  "Lagja 5 Maji": 12500,
  "Lagja 28 Nëntori": 8700,
  "Lagja Kala": 15200,
  "Lagja Luigj Gurakuqi": 9800,
  "Lagja Partizani": 11300,
  "Lagja Skënderbeu": 7600,
  "Lagja 11 Nëntori": 13400,
  "Lagja Republika": 6900,
  "Lagja Kongresi i Elbasanit": 10200,
  "Lagja Aqif Pasha": 8100,
  "Lagja Dyli Haxhire": 5400,
  "Lagja Shën Koll": 7200,
  "Lagja Sopotit": 4800,
  "Lagja Shirgjan": 3600,
  "Lagja Bradashesh": 2900,
};
