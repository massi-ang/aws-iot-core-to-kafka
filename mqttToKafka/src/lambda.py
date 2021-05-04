from kafka import KafkaProducer
from kafka.errors import KafkaTimeoutError
import json
import os

servers = os.environ["BOOTSTRAP_SERVERS"]
topic = os.environ["KAFKA_TOPIC"]

producer = KafkaProducer(bootstrap_servers=servers)

def handler(event, context):
    payload = bytes(json.dumps(event), "utf8")
    try:
        future = producer.send(topic, payload)
        future.get(timeout=10)
    except KafkaTimeoutError as ex:
        print(ex)

if __name__ == "__main__":
    handler({'test': 1}, None)