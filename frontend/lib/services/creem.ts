/**
 * NOTE: This is a MOCK implementation of the Creem SDK.
 * It is intended for development purposes and simulates the behavior of the real Creem API.
 * The actual implementation should be done once the official Creem SDK is available.
 */

import {
  CreemTranslationRepository,
  TranslationProvider,
  TranslationRequest,
  TranslationResult,
  CheckoutSession,
} from '../../shared/types'
import { APP_CONFIG } from '../../config/app.config'
import { getTranslationCacheKey, withCache } from './cache'

class MockCreem {
  private apiKey: string;

  constructor(apiKey?: string) {
    if (!apiKey) {
      throw new Error('Creem API key is required.');
    }
    this.apiKey = apiKey;
  }

  public checkout = {
    sessions: {
      create: async (
        params: any
      ): Promise<CheckoutSession> => {
        console.log('Mock Creem Checkout Session Create called with:', params);

        if (!params.line_items || params.line_items.length === 0) {
          throw new Error('Line items are required.');
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return a mock checkout session object
        const sessionId = `cs_test_${Date.now()}`;
        const mockUrl = new URL('/mock-payment-page', 'https://creem.example.com');
        mockUrl.searchParams.set('session_id', sessionId);
        mockUrl.searchParams.set('price_id', params.line_items[0].price);
        mockUrl.searchParams.set('customer_email', params.customer_email);
        mockUrl.searchParams.set('success_url', params.success_url);
        mockUrl.searchParams.set('cancel_url', params.cancel_url);
        
        return {
          id: sessionId,
          object: 'checkout.session',
          url: mockUrl.toString(),
          metadata: params.metadata,
        };
      },
    },
  };

  public refunds = {
    create: async (params: { charge: string; amount: number }): Promise<any> => {
      console.log('Mock Creem Refund Create called with:', params);

      if (!params.charge || !params.amount) {
        throw new Error('Charge ID and amount are required for a refund.');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return a mock refund object
      return {
        id: `re_test_${Date.now()}`,
        object: 'refund',
        amount: params.amount,
        charge: params.charge,
        status: 'succeeded',
      };
    },
  };

  public webhooks = {
    constructEvent: (body: string | Buffer, sig: string, secret: string): any => {
      console.log('Mock Creem Webhook validation called. In a real scenario, this would verify the signature.');
      if (!sig || !secret) {
        throw new Error('Webhook signature or secret is missing.');
      }
      // In this mock, we just parse the body and return it, assuming it's always valid.
      return JSON.parse(body.toString());
    },
  };
}


if (!APP_CONFIG.creem.secretKey) {
  throw new Error('CREEM_SECRET_KEY is not set in the environment variables.');
}

export const creemServer = new MockCreem(APP_CONFIG.creem.secretKey); 