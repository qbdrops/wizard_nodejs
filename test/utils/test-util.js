import assert from 'assert';
import { expect } from 'chai';
import Util from '@/utils/util';

describe('Util', () => {
  it('#is0xPrefixed', () => {
    assert.equal(Util.is0xPrefixed('0x123'), true);
    assert.equal(Util.is0xPrefixed('123'), false);
    assert.equal(Util.is0xPrefixed('hello'), false);
    assert.equal(Util.is0xPrefixed('0xhello'), true);
  })

  it('#remove0xPrefixed', () => {
    assert.equal(Util.remove0xPrefixed('0x123'), '123');
    assert.equal(Util.remove0xPrefixed('0xhello'), 'hello');
  })

  it('#add0x', () => {
    assert.equal(Util.add0xPrefixed('123'), '0x123');
    assert.equal(Util.add0xPrefixed('hello'), '0xhello');
  })

  it('#isHex', () => {
    assert.equal(Util.isHex('0x123'), true);
    assert.equal(Util.isHex('123'), false);
    assert.equal(Util.isHex('abc'), true);
    assert.equal(Util.isHex('hello'), false);
    assert.equal(Util.isHex('0xhello'), false);
    assert.equal(Util.isHex(0x123), false);
    assert.equal(Util.isHex(123), false);
  })

  it('#toHex', () => {
    assert.equal(Util.toHex('15'), '0xf');
    assert.equal(Util.toHex('0x10'), '0x10');
    assert.equal(Util.toHex(0x10), '0x10');
    assert.equal(Util.toHex('10'), '0xa');
    assert.equal(Util.toHex(10), '0xa');
    assert.equal(Util.toHex('0x1000000000000000000000000000000000000000000'), '0x1000000000000000000000000000000000000000000');
    assert.equal(Util.toHex('1000000000000000000000000000000000000000000'), '0xb7abc627050305adf14a3d9e40000000000');
    assert.equal(Util.toHex('5994991400000000000000'), '0x144fd37f37969ba8000');
  })

  it('#isInteger', () => {
    assert.equal(Util.isInteger('0x123'), false);
    assert.equal(Util.isInteger('123'), true);
    assert.equal(Util.isInteger('abc'), false);
    assert.equal(Util.isInteger('hello'), false);
    assert.equal(Util.isInteger('0xhello'), false);
    assert.equal(Util.isInteger(0x123), true);
    assert.equal(Util.isInteger(123), true);
    assert.equal(Util.isInteger(0.1), false);
  })

  it('#isBN', () => {
    assert.equal(Util.isBN(new Util.BN(123)), true);
    assert.equal(Util.isBN(Util.toBN(123)), true);
    assert.equal(Util.isBN(123), false);
  })

  it('#toBN', () => {
    assert.equal(Util.toBN('10000000000000000000000000000000000000000000000000000000000000000000000000').toString(), '10000000000000000000000000000000000000000000000000000000000000000000000000');
    assert.equal(Util.toBN('0x10').toString(), '16');
    assert.equal(Util.toBN(0x10).toString(), '16');
    assert.equal(Util.toBN('10').toString(), '10');
    assert.equal(Util.toBN(10).toString(), '10');
    assert.equal(Util.toBN('a').toString(), '10');
    assert.equal(Util.toBN('00847608b7104733559e8f2148dd91a7897b8506c7978683fe71d0cdbf83320b').toString(16), '847608b7104733559e8f2148dd91a7897b8506c7978683fe71d0cdbf83320b');
    assert.equal(Util.toBN('00847608b7104733559e8f2148dd91a7897b8506c7978683fe71d0cdbf83320b').toString(10), '234038453578087163644992691884977436962417032415741368959449183607918375435');
    expect(() => Util.toBN('0.1')).to.throw('Please pass integer as parameter');
    expect(() => Util.toBN(0.1)).to.throw('Please pass integer as parameter');
  })

  it('#isByte32', () => {
    assert.equal(Util.isByte32('0000000000000000000000000000000000000000000000000000000000000123'), true);
    assert.equal(Util.isByte32('0x0000000000000000000000000000000000000000000000000000000000000123'), true);
    assert.equal(Util.isByte32('0x00000000000000000000000000000000000000000000000000000000000123'), false);
    assert.equal(Util.isByte32('123'), false);
    assert.equal(Util.isByte32('0x123'), false);
  })

  it('#toByte32', () => {
    assert.equal(Util.toByte32('0x123'), '0000000000000000000000000000000000000000000000000000000000000123');
    assert.equal(Util.toByte32('123'), '000000000000000000000000000000000000000000000000000000000000007b');
    assert.equal(Util.toByte32('10'), '000000000000000000000000000000000000000000000000000000000000000a');
    assert.equal(Util.toByte32('a'), '000000000000000000000000000000000000000000000000000000000000000a');
    assert.equal(Util.toByte32('0x1000000000000000000000000000000000000000000'), '0000000000000000000001000000000000000000000000000000000000000000');
  })

  it('#toWei', () => {
    assert.equal(Util.toWei('10000000000000000000000000000000000000000000000000000000000000000000000000'), '10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
    assert.equal(Util.toWei('100000'), '100000000000000000000000');
    assert.equal(Util.toWei('10000'), '10000000000000000000000');
    assert.equal(Util.toWei('100'), '100000000000000000000');
    assert.equal(Util.toWei('10'), '10000000000000000000');
    assert.equal(Util.toWei('1'), '1000000000000000000');
    assert.equal(Util.toWei('0.1'), '100000000000000000');
    assert.equal(Util.toWei('0.01'), '10000000000000000');
    assert.equal(Util.toWei('0.001'), '1000000000000000');
    assert.equal(Util.toWei('0.0001'), '100000000000000');
    assert.equal(Util.toWei('0.00001'), '10000000000000');
    assert.equal(Util.toWei('0.000001'), '1000000000000');
    assert.equal(Util.toWei('0.0000001'), '100000000000');
    assert.equal(Util.toWei('0.00000001'), '10000000000');
    assert.equal(Util.toWei('0.000000001'), '1000000000');
    assert.equal(Util.toWei('0.0000000001'), '100000000');
    assert.equal(Util.toWei('0.00000000001'), '10000000');
    assert.equal(Util.toWei('0.000000000001'), '1000000');
    assert.equal(Util.toWei('0.0000000000001'), '100000');
    assert.equal(Util.toWei('0.00000000000001'), '10000');
    assert.equal(Util.toWei('0.000000000000001'), '1000');
    assert.equal(Util.toWei('0.0000000000000001'), '100');
    assert.equal(Util.toWei('0.00000000000000001'), '10');
    assert.equal(Util.toWei('0.000000000000000001'), '1');
    assert.equal(Util.toWei('5994.9914'), '5994991400000000000000');
    expect(() => Util.toWei('0.00008999999999999999')).to.throw('The fraction number is out of limit.');
  })

  it('#sha3', () => {
    assert.equal(Util.sha3('hello'), '1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8');
  })
});
