import client from './client';
import { Rfp, RfpInput, StructuredRfp, ComparisonResult } from '../types';

export const createRfp = async (data: RfpInput): Promise<Rfp> => {
  const response = await client.post('/rfp', data);
  return response.data;
};

export const getRfps = async (): Promise<Rfp[]> => {
  const response = await client.get('/rfp');
  return response.data;
};

export const getRfpById = async (id: number): Promise<Rfp> => {
  const response = await client.get(`/rfp/${id}`);
  return response.data;
};

export const generateRfpFromText = async (text: string): Promise<StructuredRfp> => {
  const response = await client.post('/rfp/from-text', { text });
  return response.data;
};

export const compareProposals = async (id: number): Promise<ComparisonResult> => {
  const response = await client.get(`/rfp/${id}/compare`);
  return response.data;
};
