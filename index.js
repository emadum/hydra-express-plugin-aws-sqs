'use strict';

const HydraExpressPlugin = require('hydra-express-plugin');
const SQSWorker = require('./sqs-worker');

/**
 * @name SQSPlugin
 * @summary HydraExpressPlugin for AWS SQS
 * @extends HydraExpressPlugin
 */
class SQSPlugin extends HydraExpressPlugin {
  constructor() {
    super('aws-sqs');
  }
  /**
   * @override
   */
  setHydraExpress(hydraExpress) {
    super.setHydraExpress(hydraExpress);
    this.sqs = new SQSWorker();
    this.sqs.on('log', args => hydraExpress.appLogger.info(...args));
    this.sqs.on('error', err => hydraExpress.appLogger.error({err}));
  }
  /**
   * @override
   */
  setConfig(serviceConfig) {
    super.setConfig(serviceConfig);
    this.sqs.init(this.opts);
    this.hydraExpress.sqs = this.sqs;
  }
  /**
   * @override
   */
  onServiceReady() { /*noop*/ }
}

module.exports = SQSPlugin;
