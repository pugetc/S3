const { config } = require('../../../Config');

/**
 * Set property isNonTransientTarget to 'true' to the default CRR target
 * when the location is transient and CRR is enabled, to tell the CRR
 * status processor which location to transition to after CRR is
 * complete.
 *
 * @param {string} location - The name of the location constraint
 * @param {object} replicationInfo - The object's replication info
 * @return {boolean} - whether one replication target has been marked
 * as non-transient
 */
function markNonTransientLocation(location, replicationInfo) {
    if (!config.locationConstraintIsTransient(location)
        || !replicationInfo || replicationInfo.status !== 'PENDING') {
        return false;
    }
    let defaultCloudReplicationEndpoint = config.replicationEndpoints.find(
        endpoint => endpoint.default);
    if (!defaultCloudReplicationEndpoint) {
        defaultCloudReplicationEndpoint = config.replicationEndpoints[0];
    }
    let nonTransientBackend = replicationInfo.backends.find(
        backend => backend.site === defaultCloudReplicationEndpoint.site);
    if (!nonTransientBackend) {
        nonTransientBackend = replicationInfo.backends[0];
    }
    nonTransientBackend.isNonTransientTarget = true;
    return true;
}

module.exports = markNonTransientLocation;
