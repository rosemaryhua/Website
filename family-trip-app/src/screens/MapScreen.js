import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useTrip } from '../context/TripContext';
import { FAMILIES } from '../constants/families';
import { FamilyFilterBar } from '../components/FamilyBadge';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const { itineraries, selectedFamily, selectFamily } = useTrip();
  const mapRef = useRef(null);

  const markers = useMemo(() => {
    const result = [];
    const familyIds = selectedFamily ? [selectedFamily] : FAMILIES.map((f) => f.id);

    for (const familyId of familyIds) {
      const family = FAMILIES.find((f) => f.id === familyId);
      const events = itineraries[familyId] || [];

      for (const event of events) {
        if (event.latitude && event.longitude) {
          result.push({
            ...event,
            familyId,
            familyName: family?.name || familyId,
            familyColor: family?.color || '#999',
            familyEmoji: family?.emoji || '',
            coordinate: {
              latitude: event.latitude,
              longitude: event.longitude,
            },
          });
        }
      }
    }

    return result;
  }, [itineraries, selectedFamily]);

  // Calculate initial region from markers
  const initialRegion = useMemo(() => {
    if (markers.length === 0) {
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 10,
        longitudeDelta: 10,
      };
    }

    const lats = markers.map((m) => m.coordinate.latitude);
    const lngs = markers.map((m) => m.coordinate.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.3, 0.05),
      longitudeDelta: Math.max((maxLng - minLng) * 1.3, 0.05),
    };
  }, [markers]);

  return (
    <View style={styles.container}>
      <FamilyFilterBar selectedFamily={selectedFamily} onSelect={selectFamily} />

      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.familyId}-${marker.id || index}`}
            coordinate={marker.coordinate}
            pinColor={marker.familyColor}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{marker.activity}</Text>
                <Text style={styles.calloutDetail}>
                  {marker.familyEmoji} {marker.familyName}
                </Text>
                <Text style={styles.calloutDetail}>
                  {marker.date} {marker.time}
                </Text>
                {marker.location ? (
                  <Text style={styles.calloutLocation}>{marker.location}</Text>
                ) : null}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {markers.length === 0 && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            No locations with coordinates yet.{'\n'}Add latitude/longitude to your events to see them on the map.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  callout: { padding: 8, maxWidth: 200 },
  calloutTitle: { fontSize: 14, fontWeight: '700', color: '#222' },
  calloutDetail: { fontSize: 12, color: '#666', marginTop: 2 },
  calloutLocation: { fontSize: 11, color: '#999', marginTop: 2 },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  overlayText: { textAlign: 'center', color: '#888', fontSize: 13, lineHeight: 20 },
});
