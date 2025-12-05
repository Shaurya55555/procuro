import client from './client';
import { Vendor, VendorInput } from '../types';

export const getVendors = async (): Promise<Vendor[]> => {
  const response = await client.get('/vendors');
  return response.data;
};

export const createVendor = async (data: VendorInput): Promise<Vendor> => {
  const response = await client.post('/vendors', data);
  return response.data;
};
