import axios from 'axios';

const API_KEY = '45569905-80e22f08ebb1faf5bb8ca9cf4';
const BASE_URL = 'https://pixabay.com/api/';

export async function getImagesByQuery(query) {
  const response = await axios.get(BASE_URL, {
    params: {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    },
  });
  return response.data;
}
