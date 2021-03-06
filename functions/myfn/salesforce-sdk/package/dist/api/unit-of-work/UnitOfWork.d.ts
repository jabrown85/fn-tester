import { Logger } from '@salesforce/core';
import { ConnectionConfig, Error as ApiError, Method, SObject } from './../..';
import { CompositeRequest } from './CompositeRequest';
import { CompositeResponse, CompositeSubresponse } from './CompositeApi';
import { CompositeSubrequest } from './CompositeSubrequest';
interface IReferenceIdToCompositeSubrequests {
    [key: string]: CompositeSubrequest;
}
interface UuidToReferenceIds {
    [key: string]: Set<string>;
}
/**
 * Individual unit of work result.
 */
export declare class UnitOfWorkResult {
    readonly method: Method;
    readonly id: string;
    readonly isSuccess: boolean;
    readonly errors: ReadonlyArray<ApiError>;
    constructor(method: Method, id: string, isSuccess: boolean, errors: ReadonlyArray<ApiError>);
    /**
     * @returns string for logging, starts with 'ok' if successful, 'ERROR' if not.
     */
    toString(): string;
    private errToString;
}
/**
 * Container helper to convert composite responses to UnitOfWorkResult's for both successful
 * and failed UnitOfWork responses.
 */
declare class UnitOfWorkResultMapper {
    protected readonly _uuidToReferenceIds: UuidToReferenceIds;
    protected readonly _referenceIdToCompositeSubrequests: IReferenceIdToCompositeSubrequests;
    protected readonly _compositeResponse: CompositeResponse;
    constructor(_uuidToReferenceIds: UuidToReferenceIds, _referenceIdToCompositeSubrequests: IReferenceIdToCompositeSubrequests, _compositeResponse: CompositeResponse);
    getResults(sObject: SObject): ReadonlyArray<UnitOfWorkResult>;
    getId(sObject: SObject): string;
    toUowResult(subResp: CompositeSubresponse): UnitOfWorkResult;
}
/**
 * Base Unit of Work Response.
 */
export declare abstract class UnitOfWorkResponse {
    protected _resultMapper: UnitOfWorkResultMapper;
    readonly success: boolean;
    constructor(_resultMapper: UnitOfWorkResultMapper, success: boolean);
    getResults(sObject: SObject): ReadonlyArray<UnitOfWorkResult>;
    getId(sObject: SObject): string;
}
/**
 * Successful Unit of Work Response
 */
export declare class UnitOfWorkSuccessResponse extends UnitOfWorkResponse {
    constructor(resultMapper: UnitOfWorkResultMapper);
}
/**
 * Failed Unit of Work Response
 */
export declare class UnitOfWorkErrorResponse extends UnitOfWorkResponse {
    private _rootCause;
    constructor(resultMapper: UnitOfWorkResultMapper, _rootCause: CompositeSubresponse);
    get rootCause(): UnitOfWorkResult;
}
/**
 * UnitOfWork allows you to access salesforce SObject and work with them via salesforce composite API,
 * which executes a series of REST API requests in a single call.
 * All modifications to SObject are recorded by the UnitOfWork, at the end they may be committed as a single call.
 * The result is transactional, if an error occurs, the entire UnitOfWork request is rolled back.
 *
 * See https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_composite.htm
 *
 */
export declare class UnitOfWork {
    private readonly _config;
    private logger;
    private readonly _compositeRequest;
    private readonly _uuidToReferenceIds;
    private readonly _referenceIdToCompositeSubrequests;
    constructor(_config: ConnectionConfig, logger: Logger);
    /**
     * Add new object to be inserted in this UOW.
     * @param sObject new object to be inserted.
     * @returns this to allow chaining registerNew(...).register...
     */
    registerNew(sObject: SObject): UnitOfWork;
    /**
     * Add modified object to be updated in this UOW.
     * @param sObject object to be updated.
     * @returns this to allow chaining registerModified(...).register...
     */
    registerModified(sObject: SObject): UnitOfWork;
    /**
     * Add object to be deleted in this UOW.
     * @param sObject to be deleted.
     * @returns this to allow chaining registerDeleted(...).register...
     */
    registerDeleted(sObject: SObject): UnitOfWork;
    /**
     * Post this unit of work to be committed.
     * @returns async resolved {@see UnitOfWorkSuccessResponse} if successful, or
     *     {@see UnitOfWorkErrorResponse} if failed.
     */
    commit(): Promise<UnitOfWorkSuccessResponse | UnitOfWorkErrorResponse>;
    private isRootCause;
    private rootFailedSubResponse;
    private toUnitOfWorkErrorResponse;
    /**
     * Use composite API, prior to apiVersion v50.0
     */
    private commitComposite;
    /**
     * Use graph API to get higher limit, planned GA in apiVersion=50.0
     */
    private commitGraph;
    private addCompositeSubrequest;
    get compositeRequest(): CompositeRequest;
}
export {};
