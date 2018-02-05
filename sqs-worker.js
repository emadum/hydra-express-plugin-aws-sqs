const EventEmitter = require('events');
const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');

class SQSWorker extends EventEmitter {

  constructor() {
    super();
  }

  init(awsConfig) {
    this.queueUrl = awsConfig.sqsQueueUrl;
    AWS.config.update({
      region: awsConfig.region,
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey
    });
    this.queueWorker = Consumer.create({
      queueUrl: this.queueUrl,
      handleMessage: this.handleMessage.bind(this),
      sqs: new AWS.SQS()
    });
    this.queueWorker.on('error', error => this.log('QueueWorker Error', error));
  }

  startQueue() {
    this.log('QueueWorker Starting.');
    this.queueWorker.start();
  }

  stopQueue() {
    this.queueWorker.stop();
  }

  log(...args) {
    this.emit('log', args);
  }

  async enqueueMessage(messageBody, QueueUrl = this.queueUrl) {
    return await new Promise(
      (resolve, reject) => this.queueWorker.sqs.sendMessage(
        {
          MessageAttributes: {},
          MessageBody: JSON.stringify(messageBody),
          QueueUrl
        },
        (err, data) => err ? reject(err) : resolve(data)
      )
    );
  }

  async handleMessage(message, done) {
    try {
      this.emit('message', {
        body: JSON.parse(message.Body),
        done
      });
    } catch (error) {
      this.emit('error', error);
      done(error);
    }
  }
}

module.exports = SQSWorker;
