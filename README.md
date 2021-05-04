# MQTT to Kafka Lambda

## Create Amazon MSK cluster

Create a new MSK cluster. Note the following:
- bootstrap servers
- vpc id
- subnet ids

Create the Kafka topic that will be used by the Lambda function. The Lambda function can be modified to use dynamic topics based on the content of the event being received. 

When using this Lambda function as an action for AWS IoT Rules, The event is a JSON containing the fields in the `SELECT` clause.

## Deploy this stack

```bash
cd cdk
npm install
npm run build
cdk deploy --parameters kafkaTopic=<kafkatopic> --parameters kafkaServers=<the kafka bootstrap servers>  --parameters vpcId=<vpc id of MSK> --parameters subnetIds=<subnetId1,subnetId2,... of MSK>
```

This will deploy the Lambda function and output the Security Group Id of the function.

Go the MSK console, click on the security group of the cluster and add a new Inboud rule where the source is the above Security Group (normally the name will be `CDK...`)

Open the AWS IoT console, select **Act** and create a rule with a Lambda action. Select the Lambda function deployed by the stack (`...MqttToKafka...`)

In the AWS IoT console select **Test** and try publishing a message to the AWS IoT topic you used in the rule. At the same time check with a Kafka client that the messages are received. 


## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
