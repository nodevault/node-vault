// Type definitions for node-vault 0.9.8
// Project: https://github.com/kr1sp1n/node-vault
// Definitions by: Jianrong Yu <https://github.com/YuJianrong>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

import * as httpClient from "axios";

declare namespace NodeVault {
    interface Options {
        [p: string]: any;
    }

    interface HttpOptions extends Options {
        path: string;
        method: string;
    }

    interface functionConf {
        method: string;
        path: string;
        schema?: {
            req?: Options;
            query?: Options;
            res?: Options;
        };
    }
    interface VaultError extends Error { }

    interface ApiResponseError extends VaultError {
        response: {
            statusCode: number,
            body: any
        }
    }

    interface client {
        handleVaultResponse(res?: { statusCode: number, request: Options, body: any }): Promise<any>;
        apiVersion: string;
        endpoint: string;
        token: string;

        request(HttpOptions: HttpOptions): Promise<any>;

        help(path: string, requestOptions?: Options): Promise<any>;
        write(path: string, data: any, requestOptions?: Options): Promise<any>;
        read(path: string, requestOptions?: Options): Promise<any>;
        list(path: string, requestOptions?: Options): Promise<any>;
        delete(path: string, requestOptions?: Options): Promise<any>;

        generateFunction(name: string, conf: functionConf): void;

        status(options?: Options): Promise<any>;
        initialized(options?: Options): Promise<any>;
        init(options?: Options): Promise<any>;
        unseal(options?: Options): Promise<any>;
        seal(options?: Options): Promise<any>;
        generateRootStatus(options?: Options): Promise<any>;
        generateRootInit(options?: Options): Promise<any>;
        generateRootCancel(options?: Options): Promise<any>;
        generateRootUpdate(options?: Options): Promise<any>;
        mounts(options?: Options): Promise<any>;
        mount(options?: Options): Promise<any>;
        unmount(options?: Options): Promise<any>;
        remount(options?: Options): Promise<any>;
        policies(options?: Options): Promise<any>;
        addPolicy(options?: Options): Promise<any>;
        getPolicy(options?: Options): Promise<any>;
        removePolicy(options?: Options): Promise<any>;
        auths(options?: Options): Promise<any>;
        enableAuth(options?: Options): Promise<any>;
        disableAuth(options?: Options): Promise<any>;
        audits(options?: Options): Promise<any>;
        enableAudit(options?: Options): Promise<any>;
        disableAudit(options?: Options): Promise<any>;
        renew(options?: Options): Promise<any>;
        revoke(options?: Options): Promise<any>;
        revokePrefix(options?: Options): Promise<any>;
        rotate(options?: Options): Promise<any>;
        gcpLogin(options?: Options): Promise<any>;
        ldapLogin(options?: Options): Promise<any>;
        githubLogin(options?: Options): Promise<any>;
        userpassLogin(options?: Options): Promise<any>;
        kubernetesLogin(options?: Options): Promise<any>;
        awsIamLogin(options?: Options): Promise<any>;
        ldapLogin(options?: Options): Promise<any>;
        oktaLogin(options?: Options): Promise<any>;
        radiusLogin(options?: Options): Promise<any>;
        certLogin(options?: Options): Promise<any>;
        tokenAccessors(options?: Options): Promise<any>;
        tokenCreate(options?: Options): Promise<any>;
        tokenCreateOrphan(options?: Options): Promise<any>;
        tokenCreateRole(options?: Options): Promise<any>;
        tokenLookup(options?: Options): Promise<any>;
        tokenLookupAccessor(options?: Options): Promise<any>;
        tokenLookupSelf(options?: Options): Promise<any>;
        tokenRenew(options?: Options): Promise<any>;
        tokenRenewSelf(options?: Options): Promise<any>;
        tokenRevoke(options?: Options): Promise<any>;
        tokenRevokeAccessor(options?: Options): Promise<any>;
        tokenRevokeOrphan(options?: Options): Promise<any>;
        tokenRevokeSelf(options?: Options): Promise<any>;
        tokenRoles(options?: Options): Promise<any>;
        addTokenRole(options?: Options): Promise<any>;
        getTokenRole(options?: Options): Promise<any>;
        removeTokenRole(options?: Options): Promise<any>;
        approleRoles(options?: Options): Promise<any>;
        addApproleRole(options?: Options): Promise<any>;
        getApproleRole(options?: Options): Promise<any>;
        deleteApproleRole(options?: Options): Promise<any>;
        getApproleRoleId(options?: Options): Promise<any>;
        updateApproleRoleId(options?: Options): Promise<any>;
        getApproleRoleSecret(options?: Options): Promise<any>;
        approleSecretAccessors(options?: Options): Promise<any>;
        approleSecretLookup(options?: Options): Promise<any>;
        approleSecretDestroy(options?: Options): Promise<any>;
        approleSecretAccessorLookup(options?: Options): Promise<any>;
        approleSecretAccessorDestroy(options?: Options): Promise<any>;
        approleLogin(options?: Options): Promise<any>;
        health(options?: Options): Promise<any>;
        leader(options?: Options): Promise<any>;
        stepDown(options?: Options): Promise<any>;
        encryptData(options?: Options): Promise<any>;
        decryptData(options?: Options): Promise<any>;
        generateDatabaseCredentials(options?: Options): Promise<any>;
    }

    interface VaultOptions {
        debug?(...args: any[]): any;
        tv4?(...args: any[]): any;
        commands?: Array<{ method: string, path: string, scheme: any }>;
        mustache?: any;
        httpOptions?: httpClient.AxiosRequestConfig
        Promise?: PromiseConstructor;
        apiVersion?: string;
        endpoint?: string;
        namespace?: string;
        noCustomHTTPVerbs?: boolean;
        pathPrefix?: string;
        token?: string;
    }
}

declare function NodeVault(options?: NodeVault.VaultOptions): NodeVault.client;
export = NodeVault;
