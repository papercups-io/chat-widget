import {isValidUuid, noop} from './utils';

describe('utils', () => {
  describe('isValidUuid', () => {
    it('returns false for non-strings', () => {
      expect(isValidUuid(1)).toBeFalsy();
      expect(isValidUuid(100000)).toBeFalsy();
      expect(isValidUuid(true)).toBeFalsy();
      expect(isValidUuid({})).toBeFalsy();
      expect(isValidUuid([])).toBeFalsy();
      expect(isValidUuid(noop)).toBeFalsy();
    });

    it('returns false for non-UUID strings', () => {
      expect(isValidUuid('hello')).toBeFalsy();
      expect(isValidUuid('123-123-123')).toBeFalsy();
      expect(isValidUuid('zz504736-0f20-4978-98ff-1a82ae60b266')).toBeFalsy();
      expect(isValidUuid('zz504736-0f20-4978-98-1a82ae60b26699')).toBeFalsy();
    });

    it('returns true for valid UUIDs', () => {
      expect(isValidUuid('ab504736-0f20-4978-98ff-1a82ae60b266')).toBeTruthy();
      expect(isValidUuid('970df8e8-3107-4487-8316-81e089b8c2cf')).toBeTruthy();
    });
  });
});
