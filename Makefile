SDK_REPO = ~/dev/forcedotcom/sf-fx-sdk-nodejs/
MIDDLEWARE_REPO = ~/dev/forcedotcom/nodejs-sf-fx-buildpack/
PACK_IMAGES_REPO = ~/dev/heroku/pack-images/
FN_REPO = ~/dev/jabrown85/fn-tester
FUNCTION_NAME = myfn
EG_TARGET = AcmeApp
EG_SPACE = production
IMAGE_NAME = fntester
SCRATCH_USER = AcmeScratch
DEVHUB_USER = my-devhub
BUILDER_IMAGE = heroku/heroku:18-local

sdk:
	cd $(SDK_REPO) && \
	yarn pack

copysdk:
	mkdir -p $(FN_REPO)/functions/$(FUNCTION_NAME)/salesforce-sdk && \
	tar -C $(FN_REPO)/functions/$(FUNCTION_NAME)/salesforce-sdk -xvf $(SDK_REPO)/salesforce-salesforce-sdk-v1.4.0.tgz

install:
	cd functions/$(FUNCTION_NAME) && \
	npm install && \
	rm package-lock.json

middleware:
	cd $(MIDDLEWARE_REPO)/middleware && npm install && \
	cd $(MIDDLEWARE_REPO) && make package

builder: sdk copysdk install middleware
	cd $(PACK_IMAGES_REPO) && \
	pack create-builder $(BUILDER_IMAGE) --config builder.toml

build:
	@sfdx evergreen:function:build $(IMAGE_NAME) --builder $(BUILDER_IMAGE) --no-pull --path $(FN_REPO)/functions/$(FUNCTION_NAME) --verbose

run:
	@docker run -it -p 8080:8080 $(IMAGE_NAME)

start:
	cd functions/$(FUNCTION_NAME) && \
	sfdx evergreen:function:start --builder $(BUILDER_IMAGE) --no-pull --verbose

invoke:
	sfdx evergreen:function:invoke http://localhost:8080 --payload='@functions/$(FUNCTION_NAME)/payload.json' -u $(DEVHUB_USER)

deploy:
	cd functions/$(FUNCTION_NAME) && \
	sfdx evergreen:function:deploy -t $(EG_TARGET) -u $(SCRATCH_USER)

release:
	sfdx evergreen:function:release -t $(EG_TARGET) -f $(FUNCTION_NAME) -i $$(sfdx evergreen:image:push -s $(EG_SPACE) $(IMAGE_NAME) 2> /dev/null)

push-apex:
	cd force-app/main/default/classes && \
	sfdx force:source:push

invoke-apex:
	cd force-app/main/default && \
	echo "FunctionApex.test();" | sfdx force:apex:execute -f /dev/stdin

push-all: release push-apex

logs:
	sfdx evergreen:logs -t $(EG_TARGET) -f $(FUNCTION_NAME)

deploy-all: builder build push-all
