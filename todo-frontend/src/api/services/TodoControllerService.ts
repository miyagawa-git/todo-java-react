/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Todo } from '../models/Todo';
import type { TodoReq } from '../models/TodoReq';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TodoControllerService {
    /**
     * @param id
     * @returns Todo OK
     * @throws ApiError
     */
    public static get(
        id: number,
    ): CancelablePromise<Todo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/todos/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static update(
        id: number,
        requestBody: TodoReq,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/todos/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static delete(
        id: number,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/todos/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Todo OK
     * @throws ApiError
     */
    public static list(): CancelablePromise<Array<Todo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/todos',
        });
    }
    /**
     * @param requestBody
     * @returns Todo OK
     * @throws ApiError
     */
    public static create(
        requestBody: TodoReq,
    ): CancelablePromise<Todo> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/todos',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
