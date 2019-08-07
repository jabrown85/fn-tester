send-ce-structured:
	curl -d'@payloads/structured-event.json' \
     -H'Content-Type:application/cloudevents+json' \
     -H'Accept:application/json' \
     http://localhost:8080/

send-ce-binary:
	curl -d'@payloads/binary-event.json' \
     -H'Content-Type:application/json' \
     -H'Accept:application/json' \
     -H'ce-specversion:0.3' \
     -H'ce-type:com.github.pull.create' \
     -H'ce-source:https://github.com/cloudevents/spec/pull/123' \
     -H'ce-id:45c83279-c8a1-4db6-a703-b3768db93887' \
     -H'ce-time:2019-06-21T17:31:00Z' \
     http://localhost:8080/

send-raw:
	curl -d'{"much":"wow"}' \
     -H'Content-Type:application/json' \
     -H'Accept:application/json' \
     http://localhost:8080/
