const axios = require('axios');

class TomTomService {
  constructor() {
    this.apiKey = process.env.TOMTOM_API_KEY;
    this.baseUrl = 'https://api.tomtom.com';
  }

  async geocodeAddress(address) {
    try {
      console.log('📍 Geocoding address:', address);
      
      const encodedAddress = encodeURIComponent(address);
      const url = `${this.baseUrl}/search/2/geocode/${encodedAddress}.json`;
      
      const response = await axios.get(url, {
        params: { 
          key: this.apiKey, 
          limit: 1,
          countrySet: 'IN' // Restrict to India for better results
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const position = result.position;
        console.log('✅ Geocoded to:', position);
        
        return {
          lat: position.lat,
          lon: position.lon,
          lng: position.lon, // Keep both for compatibility
          address: result.address.freeformAddress
        };
      }
      console.log('❌ No results found for address:', address);
      return null;
    } catch (error) {
      console.error('❌ Geocoding error:', error.response?.data || error.message);
      throw error;
    }
  }

  async calculateRoute(start, end) {
    try {
      console.log('🛣️ Calculating route from:', start, 'to:', end);
      
      // Validate coordinates are in India (rough bounds)
      if (start.lat < 8 || start.lat > 37 || start.lon < 68 || start.lon > 97) {
        throw new Error('Start location is outside India');
      }
      if (end.lat < 8 || end.lat > 37 || end.lon < 68 || end.lon > 97) {
        throw new Error('End location is outside India');
      }

      const url = `${this.baseUrl}/routing/1/calculateRoute/${start.lat},${start.lon}:${end.lat},${end.lon}/json`;
      
      console.log('📡 TomTom API URL:', url);
      
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          travelMode: 'car',
          traffic: true,
          computeTravelTimeFor: 'all'
        }
      });

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = response.data.routes[0];
      const summary = route.summary;
      
      console.log('✅ Route calculated:', {
        distance: summary.lengthInMeters,
        time: summary.travelTimeInSeconds
      });

      return {
        distance: summary.lengthInMeters / 1000, // Convert to km
        travelTime: summary.travelTimeInSeconds / 60, // Convert to minutes
        trafficDelay: (summary.trafficDelayInSeconds || 0) / 60
      };
    } catch (error) {
      console.error('❌ Route calculation error:', error.response?.data || error.message);
      throw error;
    }
  }

  calculateFare(distanceKm, durationMin) {
    const BASE_FARE = 50;
    const PER_KM_RATE = 15;
    const PER_MINUTE_RATE = 2;
    
    const fare = BASE_FARE + (distanceKm * PER_KM_RATE) + (durationMin * PER_MINUTE_RATE);
    console.log('💰 Calculated fare:', fare);
    return fare;
  }

  async reverseGeocode(lat, lon) {
    try {
      console.log('📍 Reverse geocoding:', lat, lon);
      
      const url = `${this.baseUrl}/search/2/reverseGeocode/${lat},${lon}.json`;
      
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          limit: 1
        }
      });

      if (response.data.addresses && response.data.addresses.length > 0) {
        const address = response.data.addresses[0].address;
        console.log('✅ Reverse geocoded to:', address.freeformAddress);
        return address.freeformAddress;
      }
      return 'Unknown location';
    } catch (error) {
      console.error('❌ Reverse geocoding error:', error.message);
      return 'Unknown location';
    }
  }
}

module.exports = new TomTomService();