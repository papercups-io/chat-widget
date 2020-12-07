import 'jest';
import * as Utils from './utils';

describe('utils', () => {
  describe('utcOffset', () => {
    it('returns offset to UTC from the given timezone', () => {
      expect(Utils.utcOffset('Asia/Jakarta')).toEqual(420)
      expect(Utils.utcOffset('America/New_York')).toEqual(-300)
      expect(Utils.utcOffset('America/Los_Angeles')).toEqual(-480)
    })
  })

  describe('offsetFromTo', () => {
    it('returns the offset from tz1 to tz2', () => {
      expect(Utils.offsetFromTo('America/Los_Angeles', 'America/New_York')).toEqual(180)
      expect(Utils.offsetFromTo('America/New_York', 'America/Los_Angeles')).toEqual(-180)
      expect(Utils.offsetFromTo('America/Los_Angeles', 'Asia/Jakarta')).toEqual(900)
    })
  })
})
