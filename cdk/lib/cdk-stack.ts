import { Vpc, SecurityGroup } from '@aws-cdk/aws-ec2';
import { PythonFunction } from '@aws-cdk/aws-lambda-python';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import { Runtime } from '@aws-cdk/aws-lambda';


export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const kafkaServers = new cdk.CfnParameter(this, 'kafkaServers', {
      type: "String",
      description: "Kafka servers"
    });

    const kafkaTopic = new cdk.CfnParameter(this, 'kafkaTopic', {
      type: "String",
      description: "Kafka topic"
    });

    const vpcId = new cdk.CfnParameter(this, 'vpcId', {
      type: "AWS::EC2::VPC::Id",
      description: "Vpc"
    });

    const subnetIds = new cdk.CfnParameter(this, 'subnetIds', {
      type: "List<AWS::EC2::Subnet::Id>",
      description: "Vpc"
    });

    const vpc = Vpc.fromVpcAttributes(this, 'vpc', {
      vpcId: vpcId.valueAsString,
      availabilityZones: cdk.Fn.getAzs(),
      privateSubnetIds: subnetIds.valueAsList
    })
    const sg = new SecurityGroup(this, 'lambdaSg', {
      vpc: vpc
    })

    const f = new PythonFunction(this, 'MqttToKafka', {
      vpc: vpc,
      securityGroups: [sg],
      entry: '../mqttToKafka/src',
      index: 'lambda.py',
      environment: {
        'BOOTSTRAP_SERVERS': kafkaServers.valueAsString,
        'KAFKA_TOPIC': kafkaTopic.valueAsString
      },
      runtime: Runtime.PYTHON_3_8
    })

    f.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ["*"],
      actions: ["ec2:CreateNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DeleteNetworkInterface",
        "ec2:AssignPrivateIpAddresses",
        "ec2:UnassignPrivateIpAddresses"
      ]
    }))

    new cdk.CfnOutput(this, 'lamndaSg', {
      description: 'Lamnbda Security Group',
      value: sg.securityGroupId
    })

  }
}
