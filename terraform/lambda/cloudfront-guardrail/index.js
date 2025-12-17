const AWS = require("aws-sdk");

const cloudfront = new AWS.CloudFront();

exports.handler = async () => {
  const distributionId = process.env.DISTRIBUTION_ID;
  if (!distributionId) {
    throw new Error("Missing DISTRIBUTION_ID");
  }

  const cfg = await cloudfront
    .getDistribution({ Id: distributionId })
    .promise();

  const dist = cfg.Distribution;
  if (!dist || !dist.DistributionConfig) {
    throw new Error("No distribution config");
  }

  if (dist.DistributionConfig.Enabled === false) {
    console.log("Distribution already disabled");
    return;
  }

  const etag = cfg.ETag;
  const updated = {
    ...dist.DistributionConfig,
    Enabled: false,
  };

  await cloudfront
    .updateDistribution({
      Id: distributionId,
      IfMatch: etag,
      DistributionConfig: updated,
    })
    .promise();

  console.log(`Disabled CloudFront distribution ${distributionId}`);
};
