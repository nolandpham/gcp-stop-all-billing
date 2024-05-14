const {CloudBillingClient} = require('@google-cloud/billing');

/**
 * Example event:
 * - Disable billing: {"data": "eyJjb3N0QW1vdW50IjoxMDAsImJ1ZGdldEFtb3VudCI6MjAwICB9"}
 */


const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;
const billing = new CloudBillingClient();

exports.stopBilling = async pubsubEvent => {
  const pubsubData = JSON.parse(
    Buffer.from(pubsubEvent.data, 'base64').toString()
  );
  console.log(`Received pubsub event: ${JSON.stringify(pubsubData)}`);
  if (pubsubData.costAmount <= pubsubData.budgetAmount) {
    const result = `No action necessary. (Current cost: ${pubsubData.costAmount})`;
    console.log(result); return result;
  }

  if (!PROJECT_ID) {
    const result = 'No project specified';
    console.log(result); return result;
  }

  const billingEnabled = await _isBillingEnabled(PROJECT_NAME);
  if (billingEnabled) {
    return _disableBillingForProject(PROJECT_NAME);
  } else {
    const result = 'Billing already disabled';
    console.log(result); return result;
  }
};

/**
 * Determine whether billing is enabled for a project
 * @param {string} projectName Name of project to check if billing is enabled
 * @return {bool} Whether project has billing enabled or not
 */
const _isBillingEnabled = async projectName => {
  try {
    const [res] = await billing.getProjectBillingInfo({name: projectName});
    return res.billingEnabled;
  } catch (e) {
    console.log('Unable to determine if billing is enabled on specified project, assuming billing is enabled');
    return true;
  }
};

/**
 * Disable billing for a project by removing its billing account
 * @param {string} projectName Name of project disable billing on
 * @return {string} Text containing response from disabling billing
 */
const _disableBillingForProject = async projectName => {
  const [res] = await billing.updateProjectBillingInfo({
    name: projectName,
    resource: {billingAccountName: ''}, // Disable billing
  });
  const result = `Billing disabled: ${JSON.stringify(res)}`;
  console.log(result); return result;
};