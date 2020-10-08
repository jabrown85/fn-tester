sdk:
	cd ~/dev/forcedotcom/sf-fx-sdk-nodejs/ && \
	yarn pack

copysdk:
	mkdir -p ~/dev/jabrown85/fn-tester/functions/myfn/salesforce-sdk && tar -C ~/dev/jabrown85/fn-tester/functions/myfn/salesforce-sdk -xvf ~/dev/forcedotcom/sf-fx-sdk-nodejs/salesforce-salesforce-sdk-v1.4.0.tgz
	mkdir -p ~/dev/jabrown85/fn-tester/functions/mytsfn/salesforce-sdk && tar -C ~/dev/jabrown85/fn-tester/functions/mytsfn/salesforce-sdk -xvf ~/dev/forcedotcom/sf-fx-sdk-nodejs/salesforce-salesforce-sdk-v1.4.0.tgz

install:
	cd functions/myfn && npm install && rm package-lock.json

middleware:
	cd ~/dev/forcedotcom/nodejs-sf-fx-buildpack/middleware && npm install && \
	cd ~/dev/forcedotcom/nodejs-sf-fx-buildpack && make package

builder: sdk copysdk install middleware
	cd ~/dev/heroku/pack-images && \
	pack create-builder h18test --config builder.toml

build:
	@sfdx evergreen:function:build fntester --builder h18test --no-pull --path ~/dev/jabrown85/fn-tester/functions/myfn --verbose

run: sdk copysdk install middleware builder build rerun

rerun:
	@docker run -it -p 8080:8080 fntester

start: sdk copysdk install middleware builder restart

restart:
	cd ~/dev/jabrown85/fn-tester/functions/myfn && sfdx evergreen:function:start --builder h18test --no-pull --verbose

buildts:
	@sfdx evergreen:function:build fntstester --builder h18test --no-pull --path ~/dev/jabrown85/fn-tester/functions/mytsfn --verbose

runts: sdk copysdk install middleware builder buildts rerunts

rerunts:
	@docker run -it -p 8080:8080 fntstester

startts: sdk copysdk install middleware builder restartts

restartts:
	cd ~/dev/jabrown85/fn-tester/functions/mytsfn && sfdx evergreen:function:start --builder h18test --no-pull --verbose
