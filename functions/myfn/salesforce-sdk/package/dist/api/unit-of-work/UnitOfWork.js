"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitOfWork = exports.UnitOfWorkErrorResponse = exports.UnitOfWorkSuccessResponse = exports.UnitOfWorkResponse = exports.UnitOfWorkResult = void 0;
const __1 = require("./../..");
const CompositeRequest_1 = require("./CompositeRequest");
const CompositeApi_1 = require("./CompositeApi");
const CompositeSubrequest_1 = require("./CompositeSubrequest");
const UnitOfWorkGraph_1 = require("./UnitOfWorkGraph");
/**
 * Individual unit of work result.
 */
class UnitOfWorkResult {
    constructor(method, id, isSuccess, errors) {
        this.method = method;
        this.id = id;
        this.isSuccess = isSuccess;
        this.errors = errors;
        this.method = method;
        this.id = id;
        this.isSuccess = isSuccess;
        this.errors = errors;
    }
    /**
     * @returns string for logging, starts with 'ok' if successful, 'ERROR' if not.
     */
    toString() {
        return this.isSuccess ? `ok ${this.method} id=${this.id}` :
            this.errors.map(e => this.errToString(e)).join(', ');
    }
    errToString(err) {
        return 'ERROR' +
            (err.message == null ? '' : ` message=${err.message}`) +
            (err.errorCode == null ? '' : ` errorCode=${err.errorCode}`) +
            (err.fields == null || err.fields.length < 1 ? '' : ` fields=[${err.fields.join(',')}]`);
    }
}
exports.UnitOfWorkResult = UnitOfWorkResult;
/**
 * Container helper to convert composite responses to UnitOfWorkResult's for both successful
 * and failed UnitOfWork responses.
 */
class UnitOfWorkResultMapper {
    constructor(_uuidToReferenceIds, _referenceIdToCompositeSubrequests, _compositeResponse) {
        this._uuidToReferenceIds = _uuidToReferenceIds;
        this._referenceIdToCompositeSubrequests = _referenceIdToCompositeSubrequests;
        this._compositeResponse = _compositeResponse;
    }
    getResults(sObject) {
        const results = [];
        const referenceIds = this._uuidToReferenceIds[sObject.uuid];
        if (referenceIds && referenceIds.size > 0) {
            const compositeSubresponses = this._compositeResponse
                .compositeSubresponses;
            if (compositeSubresponses) {
                // Use some so that it can short circuit after finding all relevant elements
                compositeSubresponses.some((compositeSubresponse) => {
                    const referenceId = compositeSubresponse.referenceId;
                    if (referenceIds.has(referenceId)) {
                        results.push(this.toUowResult(compositeSubresponse));
                        // 1:1 relationship. Exit if we have found everything
                        return results.length === referenceIds.size;
                    }
                });
            }
        }
        return results;
    }
    getId(sObject) {
        const results = this.getResults(sObject);
        if (results && results.length > 0) {
            return results[0].id;
        }
    }
    toUowResult(subResp) {
        const subReq = this._referenceIdToCompositeSubrequests[subResp.referenceId];
        if (!subReq) {
            throw new Error('Unable to find CompositeSubrequest with referenceId=' + subResp.referenceId);
        }
        const method = subReq.method;
        const id = subResp.id;
        const success = subResp.isSuccess;
        let errors;
        if (!success) {
            errors = subResp.errors;
        }
        return new UnitOfWorkResult(method, id, success, errors);
    }
}
/**
 * Base Unit of Work Response.
 */
class UnitOfWorkResponse {
    constructor(_resultMapper, success) {
        this._resultMapper = _resultMapper;
        this.success = success;
    }
    getResults(sObject) {
        return this._resultMapper.getResults(sObject);
    }
    getId(sObject) {
        return this._resultMapper.getId(sObject);
    }
}
exports.UnitOfWorkResponse = UnitOfWorkResponse;
/**
 * Successful Unit of Work Response
 */
class UnitOfWorkSuccessResponse extends UnitOfWorkResponse {
    constructor(resultMapper) {
        super(resultMapper, true);
    }
}
exports.UnitOfWorkSuccessResponse = UnitOfWorkSuccessResponse;
/**
 * Failed Unit of Work Response
 */
class UnitOfWorkErrorResponse extends UnitOfWorkResponse {
    constructor(resultMapper, _rootCause) {
        super(resultMapper, false);
        this._rootCause = _rootCause;
    }
    get rootCause() {
        return this._resultMapper.toUowResult(this._rootCause);
    }
}
exports.UnitOfWorkErrorResponse = UnitOfWorkErrorResponse;
/**
 * UnitOfWork allows you to access salesforce SObject and work with them via salesforce composite API,
 * which executes a series of REST API requests in a single call.
 * All modifications to SObject are recorded by the UnitOfWork, at the end they may be committed as a single call.
 * The result is transactional, if an error occurs, the entire UnitOfWork request is rolled back.
 *
 * See https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_composite.htm
 *
 */
class UnitOfWork {
    constructor(_config, logger) {
        this._config = _config;
        this.logger = logger;
        this._compositeRequest = new CompositeRequest_1.CompositeRequest();
        this._uuidToReferenceIds = {};
        this._referenceIdToCompositeSubrequests = {};
    }
    /**
     * Add new object to be inserted in this UOW.
     * @param sObject new object to be inserted.
     * @returns this to allow chaining registerNew(...).register...
     */
    registerNew(sObject) {
        const insertBuilder = new CompositeSubrequest_1.InsertCompositeSubrequestBuilder(this._config.apiVersion);
        const compositeSubrequest = insertBuilder.sObject(sObject).build();
        this.addCompositeSubrequest(sObject, compositeSubrequest);
        return this;
    }
    /**
     * Add modified object to be updated in this UOW.
     * @param sObject object to be updated.
     * @returns this to allow chaining registerModified(...).register...
     */
    registerModified(sObject) {
        const patchBuilder = new CompositeSubrequest_1.PatchCompositeSubrequestBuilder(this._config.apiVersion);
        const compositeSubrequest = patchBuilder.sObject(sObject).build();
        this.addCompositeSubrequest(sObject, compositeSubrequest);
        return this;
    }
    /**
     * Add object to be deleted in this UOW.
     * @param sObject to be deleted.
     * @returns this to allow chaining registerDeleted(...).register...
     */
    registerDeleted(sObject) {
        const id = sObject.id;
        if (!id) {
            throw new Error('Id not provided');
        }
        const deleteBuilder = new CompositeSubrequest_1.DeleteCompositeSubrequestBuilder(this._config.apiVersion);
        const compositeSubrequest = deleteBuilder
            .sObjectType(sObject.sObjectType)
            .id(id)
            .build();
        this.addCompositeSubrequest(sObject, compositeSubrequest);
        return this;
    }
    /**
     * Post this unit of work to be committed.
     * @returns async resolved {@see UnitOfWorkSuccessResponse} if successful, or
     *     {@see UnitOfWorkErrorResponse} if failed.
     */
    async commit() {
        //Use composite API, prior to  apiVersion 50.0
        //Use graph API to get higher limit, planned GA in apiVersion 50.0
        if (this._config.apiVersion < __1.APIVersion.V50) {
            return await this.commitComposite();
        }
        else {
            return await this.commitGraph();
        }
    }
    // Filter predicate for Root Cause: unsuccessful w/a body.errorCode that is *not* "PROCESSING_HALTED"
    isRootCause(compositeSubresponse) {
        if (compositeSubresponse && !compositeSubresponse.isSuccess && Array.isArray(compositeSubresponse.errors)) {
            if (compositeSubresponse.errors.find(e => ('errorCode' in e) && (e['errorCode'] !== 'PROCESSING_HALTED'))) {
                return true;
            }
        }
        return false;
    }
    // Find the "root cause" failed subresponse.  If root cause not identified, find first non-success
    rootFailedSubResponse(compositeSubresponses) {
        let rootSub = compositeSubresponses.find(this.isRootCause);
        if (rootSub == null) {
            // If we fail to find a subresponse that has a code other than 'PROCESSING_HALTED', grab first non `isSuccess`
            rootSub = compositeSubresponses.find(r => !r.isSuccess);
        }
        return rootSub;
    }
    // Convert a failed composite response to a UnitOfWorkErrorResponse
    toUnitOfWorkErrorResponse(failedResponse, resMapper) {
        // Attempt to find the "root cause" subresponse, if possible.  Otherwise, falls back to the first failed response
        const rootCause = this.rootFailedSubResponse(failedResponse.compositeSubresponses);
        const otherCount = failedResponse.compositeSubresponses.length - 1;
        this.logger.warn(`UnitOfWork failed rootCause=${resMapper.toUowResult(rootCause)} and count=${otherCount} other rolled-back results`);
        return new UnitOfWorkErrorResponse(resMapper, rootCause);
    }
    /**
     * Use composite API, prior to apiVersion v50.0
     */
    async commitComposite() {
        const compositeApi = new CompositeApi_1.CompositeApi(this._config, this.logger);
        const compositeResponse = await compositeApi.invoke(this._compositeRequest);
        const errorCount = compositeResponse.compositeSubresponses.filter(r => !r.isSuccess).length;
        const resMapper = new UnitOfWorkResultMapper(this._uuidToReferenceIds, this._referenceIdToCompositeSubrequests, compositeResponse);
        if (errorCount > 0) {
            return this.toUnitOfWorkErrorResponse(compositeResponse, resMapper);
        }
        return new UnitOfWorkSuccessResponse(resMapper);
    }
    /**
     * Use graph API to get higher limit, planned GA in apiVersion=50.0
     */
    async commitGraph() {
        const uowGraph = new UnitOfWorkGraph_1.UnitOfWorkGraph(this._config, this.logger, this);
        const compositeGraphResponse = await uowGraph.commit();
        const compositeResponse = compositeGraphResponse.graphResponses[0].compositeResponse;
        const errorCount = compositeResponse.compositeSubresponses.filter(r => !r.isSuccess).length;
        const resMapper = new UnitOfWorkResultMapper(this._uuidToReferenceIds, this._referenceIdToCompositeSubrequests, compositeResponse);
        if (errorCount > 0) {
            return this.toUnitOfWorkErrorResponse(compositeResponse, resMapper);
        }
        return new UnitOfWorkSuccessResponse(resMapper);
    }
    addCompositeSubrequest(sObject, compositeSubrequest) {
        const referenceId = compositeSubrequest.referenceId;
        const uuid = sObject.uuid;
        let referenceIds = this._uuidToReferenceIds[uuid];
        if (!referenceIds) {
            referenceIds = new Set();
            this._uuidToReferenceIds[uuid] = referenceIds;
        }
        referenceIds.add(referenceId);
        this._compositeRequest.addSubrequest(compositeSubrequest);
        this._referenceIdToCompositeSubrequests[referenceId] = compositeSubrequest;
    }
    get compositeRequest() {
        return this._compositeRequest;
    }
}
exports.UnitOfWork = UnitOfWork;
//# sourceMappingURL=UnitOfWork.js.map