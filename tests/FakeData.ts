import randomString from 'randomstring';
import Sample, { SampleAttributes } from '../server/models/Sample';

/**
 * Creates a row in the Sample model, with some default data.
 * Can be called repeatedly without any issues usually.
 */
async function makeDBSample(options: Partial<SampleAttributes> = {}) {
  return Sample.create({
    myNumber: options.myNumber || Math.floor(Math.random() * 1e9),
    myShortString: options.myShortString || randomString.generate(20),
    myLongText: options.myLongText || randomString.generate(50),
  });
}

export default {
  makeDBSample,
};
