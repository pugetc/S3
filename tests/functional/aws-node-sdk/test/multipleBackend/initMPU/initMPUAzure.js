const async = require('async');
const assert = require('assert');

const withV4 = require('../../support/withV4');
const BucketUtility = require('../../../lib/utility/bucket-util');
const { describeSkipIfNotMultiple, azureLocation, getAzureContainerName,
    genUniqID } = require('../utils');

const keyName = `somekey-${genUniqID()}`;

const azureContainerName = getAzureContainerName(azureLocation);
let s3;
let bucketUtil;

describeSkipIfNotMultiple('Initiate MPU to AZURE', () => {
    withV4(sigCfg => {
        beforeEach(() => {
            bucketUtil = new BucketUtility('default', sigCfg);
            s3 = bucketUtil.s3;
        });

        afterEach(() => {
            process.stdout.write('Emptying bucket\n');
            return bucketUtil.empty(azureContainerName)
            .then(() => {
                process.stdout.write('Deleting bucket\n');
                return bucketUtil.deleteOne(azureContainerName);
            })
            .catch(err => {
                process.stdout.write(`Error in afterEach: ${err}\n`);
                throw err;
            });
        });
        describe('Basic test: ', () => {
            beforeEach(done =>
              s3.createBucket({ Bucket: azureContainerName,
                  CreateBucketConfiguration: {
                      LocationConstraint: azureLocation,
                  },
              }, done));
            afterEach(function afterEachF(done) {
                const params = {
                    Bucket: azureContainerName,
                    Key: keyName,
                    UploadId: this.currentTest.uploadId,
                };
                s3.abortMultipartUpload(params, done);
            });
            it('should create MPU and list in-progress multipart uploads',
            function ifF(done) {
                const params = {
                    Bucket: azureContainerName,
                    Key: keyName,
                    Metadata: { 'scal-location-constraint': azureLocation },
                };
                async.waterfall([
                    next => s3.createMultipartUpload(params, (err, res) => {
                        this.test.uploadId = res.UploadId;
                        assert(this.test.uploadId);
                        assert.strictEqual(res.Bucket, azureContainerName);
                        assert.strictEqual(res.Key, keyName);
                        next(err);
                    }),
                    next => s3.listMultipartUploads(
                      { Bucket: azureContainerName }, (err, res) => {
                          assert.strictEqual(res.NextKeyMarker, keyName);
                          assert.strictEqual(res.NextUploadIdMarker,
                            this.test.uploadId);
                          assert.strictEqual(res.Uploads[0].Key, keyName);
                          assert.strictEqual(res.Uploads[0].UploadId,
                            this.test.uploadId);
                          next(err);
                      }),
                ], done);
            });
        });
    });
});
