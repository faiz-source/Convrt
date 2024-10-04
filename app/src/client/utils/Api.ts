import axios from 'axios';

// Fetches location data from LocationIQ (no need to cache here since it's handled in the hook)
export const fetchLocationSuggestions = async (query: string) => {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://us1.locationiq.com/v1/search?key=pk.a3de4846111cde5ca3398d088d74f1a3&q=${encodedQuery}&format=json`;

  try {
    const response = await axios.get(url);
    return response.data.map((item: any) => ({
      label: item.display_name,
      lat: item.lat,
      lon: item.lon,
    }));
  } catch (error) {
    console.error('LocationIQ API error:', error);
    throw new Error('Failed to fetch location data');
  }
};

// Fetches business data from RapidAPI
export const fetchBusinessData = async (inputValue: string, lat: string, lon: string) => {
  try {
    const response = await axios.get('https://local-business-data.p.rapidapi.com/search-in-area', {
      params: {
        query: inputValue,
        lat,
        lng: lon,
        zoom: 13,
        limit: 2,
        language: 'en',
        region: 'us',
        extract_emails_and_contacts: true,
      },
      headers: {
        'x-rapidapi-key': 'b1853cbb3fmsh4fa5768495c2edep15d8aejsn2ef3358227e0',
        'x-rapidapi-host': 'local-business-data.p.rapidapi.com',
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('RapidAPI error:', error);
    throw new Error('Failed to fetch business data');
  }
};
