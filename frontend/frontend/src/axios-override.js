import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const cachedAxios = setupCache(axios, {
  // Cache for 30 minutes
  ttl: 30 * 60 * 1000,
  interpretHeader: false,
  cacheTakeover: false,
  methods: ['get', 'post'],
});

// mock username=anuraghazra requests
cachedAxios.interceptors.request.use(
  (config) => {
    const params = config.params || {};
    if (params.username === 'anuraghazra') {
      // Return a promise that resolves with a mocked response
      return Promise.resolve({
        data: 'hello anuraghazra!',
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axios.get = cachedAxios.get.bind(cachedAxios);
axios.post = cachedAxios.post.bind(cachedAxios);

export default cachedAxios;
export const { get, post } = cachedAxios;
