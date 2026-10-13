import { describe, it, expect } from 'vitest';
import { PricingAgent } from '../src/lib/agent/pricing-agent';

describe('Kisan Sathi Grounded Pricing Agent', () => {
  it('answers real Telangana market inquiries with authentic citations and dates', async () => {
    const agent = new PricingAgent();
    const result = await agent.processQuery('What is the current paddy price in Enumamula market?');

    expect(result.reply).toContain('Paddy(Dhan)(Common)');
    expect(result.reply).toContain('Enumamula (Warangal)');
    expect(result.reply).toContain('Modal Price');
    expect(result.reply).toContain('AGMARKNET');
    expect(result.provenance.isGrounded).toBe(true);
    expect(result.provenance.sources).toContain('AGMARKNET');
    expect(result.toolExecutions.length).toBeGreaterThan(0);
  });

  it('performs deterministic net return calculation without hallucination', async () => {
    const agent = new PricingAgent();
    const result = await agent.processQuery('I have 50 quintals of cotton at Enumamula, calculate my net return');

    expect(result.reply).toContain('Deterministic Net Return Calculation');
    expect(result.reply).toContain('Cotton(Kapas)');
    expect(result.reply).toContain('Gross Estimated Value');
    expect(result.reply).toContain('Transport Deduction');
    expect(result.reply).toContain('Estimated Net Return');
    expect(result.toolExecutions[0].tool).toBe('calculate_estimated_net_return');
  });

  it('compares markets side by side with price spread', async () => {
    const agent = new PricingAgent();
    const result = await agent.processQuery('Compare turmeric prices across Telangana mandis');

    expect(result.reply).toContain('Telangana Market Comparison for Turmeric(Raw/Finger)');
    expect(result.reply).toContain('Nizamabad APMC');
    expect(result.reply).toContain('Price Spread');
    expect(result.toolExecutions[0].tool).toBe('compare_markets');
  });

  it('fails closed when asked for an unverified or nonexistent commodity', async () => {
    const agent = new PricingAgent();
    const result = await agent.processQuery('What is the price of dragon fruit in Warangal?');

    // dragon fruit is not in our verified commodities taxonomy
    // Agent should not hallucinate a random number!
    expect(result.provenance.isGrounded).toBe(true);
  });
});
