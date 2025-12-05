import client from './client';
import { Proposal, ProposalInput, ParsedProposal } from '../types';

export const createProposal = async (data: ProposalInput): Promise<Proposal> => {
  const response = await client.post('/proposals', data);
  return response.data;
};

export const parseProposalEmail = async (rawEmailText: string): Promise<ParsedProposal> => {
  const response = await client.post('/proposals/parse', { rawEmailText });
  return response.data;
};

export const getProposalsByRfpId = async (rfpId: number): Promise<Proposal[]> => {
  const response = await client.get(`/proposals/rfp/${rfpId}`);
  return response.data;
};

export const getProposalById = async (id: number): Promise<Proposal> => {
  const response = await client.get(`/proposals/${id}`);
  return response.data;
};
