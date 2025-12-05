import client from './client';
import { EmailInput } from '../types';

export const sendRfpEmail = async (data: EmailInput): Promise<void> => {
  await client.post('/email/send', data);
};
