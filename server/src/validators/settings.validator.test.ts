import test from 'node:test';
import assert from 'node:assert/strict';
import { settingsUpdateSchema, sanitizeSettingsPayload } from './settings.validator';

test('accepts a valid settings payload', () => {
  const result = settingsUpdateSchema.partial().safeParse({
    companyName: 'Yazhi Events',
    businessEmail: 'hello@yazhievents.com',
    businessPhone: '+91 9876543210',
    website: 'https://yazhievents.com',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    depositPercentage: 30,
    taxPercentage: 5,
    enableOnlinePayment: true,
  });

  assert.equal(result.success, true);
});

test('rejects invalid email addresses', () => {
  const result = settingsUpdateSchema.partial().safeParse({ businessEmail: 'not-an-email' });

  assert.equal(result.success, false);
});

test('sanitizes payloads by removing undefined values', () => {
  const payload = sanitizeSettingsPayload({ companyName: 'Yazhi', businessEmail: undefined as any, depositPercentage: 25 });

  assert.equal(payload.companyName, 'Yazhi');
  assert.equal(payload.businessEmail, undefined);
  assert.equal(payload.depositPercentage, 25);
});
