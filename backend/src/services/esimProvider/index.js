/**
 * src/services/esimProvider/index.js
 *
 * Factory that picks the active eSIM provider implementation based on
 * ESIM_PROVIDER (config/env.js). This is the ONLY file under
 * services/esimProvider/ that the rest of the app may import — never the
 * live-provider or low-level HTTP client modules directly. Both
 * mockProvider.js and the live provider implement the same interface:
 *   getLineUsage(iccid), refillLine(iccid, amountKb), listBundles()
 *
 * The live provider's implementation file is one of the two files named in
 * CLAUDE.md's hard invariant — see that file for which.
 */

const { config } = require('../../config/env');
const mockProvider = require('./mockProvider');
const liveProvider = require('./keepgoProvider');

const provider = config.esimProvider === 'live' ? liveProvider : mockProvider;

module.exports = provider;
