// Type definitions for node-vault 0.10.9
// Project: https://github.com/nodevault/node-vault
// Definitions by: Jianrong Yu <https://github.com/YuJianrong>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

import type { AxiosRequestConfig } from "axios";

declare namespace NodeVault {
    interface Option {
        [p: string]: any;
    }

    /** Backward-compatible TLS options from the former request/postman-request API. */
    interface TlsOptions {
        ca?: string | Buffer | Array<string | Buffer>;
        cert?: string | Buffer | Array<string | Buffer>;
        key?: string | Buffer | Array<string | Buffer>;
        passphrase?: string;
        pfx?: string | Buffer | Array<string | Buffer>;
        strictSSL?: boolean;
        agentOptions?: { [p: string]: any };
        timeout?: number;
    }

    interface RequestOption extends Option {
        path: string;
        method: string;
    }

    interface functionConf {
        method: string;
        path: string;
        schema?: {
            req?: Option;
            query?: Option;
            res?: Option;
        };
    }
    interface VaultError extends Error { }

    interface ApiResponseError extends VaultError {
        response: {
            statusCode: number,
            body: any
        }
    }

    interface TokenRenewalOptions {
        /** Initial TTL in seconds. If omitted, tokenLookupSelf is called. */
        ttl?: number;
        /** Increment to request when renewing. */
        increment?: number | string;
        /** Fraction of TTL at which to renew (default 0.8). */
        renewFraction?: number;
    }

    interface LeaseRenewalOptions {
        /** Increment to request when renewing. */
        increment?: number;
        /** Fraction of TTL at which to renew (default 0.8). */
        renewFraction?: number;
    }

    interface client {
        handleVaultResponse(res?: { statusCode: number, request: Option, body: any }): Promise<any>;
        apiVersion: string;
        endpoint: string;
        token: string;

        request(requestOptions: RequestOption): Promise<any>;

        help(path: string, requestOptions?: Option): Promise<any>;
        write(path: string, data: any, requestOptions?: Option): Promise<any>;
        read(path: string, requestOptions?: Option): Promise<any>;
        list(path: string, requestOptions?: Option): Promise<any>;
        delete(path: string, requestOptions?: Option): Promise<any>;
        update(path: string, data: any, requestOptions?: Option): Promise<any>;

        generateFunction(name: string, conf: functionConf): void;
        commands: { [name: string]: functionConf };

        // EventEmitter methods
        on(event: string | symbol, listener: (...args: any[]) => void): this;
        once(event: string | symbol, listener: (...args: any[]) => void): this;
        off(event: string | symbol, listener: (...args: any[]) => void): this;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
        removeAllListeners(event?: string | symbol): this;
        emit(event: string | symbol, ...args: any[]): boolean;
        listeners(event: string | symbol): Function[];
        listenerCount(event: string | symbol): number;
        eventNames(): Array<string | symbol>;

        // Token renewal
        startTokenRenewal(options?: TokenRenewalOptions): Promise<any>;
        stopTokenRenewal(): void;

        // Lease renewal
        startLeaseRenewal(leaseId: string, leaseDuration: number, options?: LeaseRenewalOptions): void;
        stopLeaseRenewal(leaseId: string): void;
        stopAllRenewals(): void;

        status(options?: Option): Promise<any>;
        initialized(options?: Option): Promise<any>;
        init(options?: Option): Promise<any>;
        unseal(options?: Option): Promise<any>;
        seal(options?: Option): Promise<any>;
        generateRootInit(options?: Option): Promise<any>;
        generateRootCancel(options?: Option): Promise<any>;
        generateRootUpdate(options?: Option): Promise<any>;
        mounts(options?: Option): Promise<any>;
        mount(options?: Option): Promise<any>;
        unmount(options?: Option): Promise<any>;
        remount(options?: Option): Promise<any>;
        policies(options?: Option): Promise<any>;
        addPolicy(options?: Option): Promise<any>;
        getPolicy(options?: Option): Promise<any>;
        removePolicy(options?: Option): Promise<any>;
        auths(options?: Option): Promise<any>;
        enableAuth(options?: Option): Promise<any>;
        disableAuth(options?: Option): Promise<any>;
        audits(options?: Option): Promise<any>;
        enableAudit(options?: Option): Promise<any>;
        disableAudit(options?: Option): Promise<any>;
        renew(options?: Option): Promise<any>;
        revoke(options?: Option): Promise<any>;
        revokePrefix(options?: Option): Promise<any>;
        rotate(options?: Option): Promise<any>;
        unwrap(options?: Option): Promise<any>;
        gcpLogin(options?: Option): Promise<any>;
        ldapLogin(options?: Option): Promise<any>;
        githubLogin(options?: Option): Promise<any>;
        userpassLogin(options?: Option): Promise<any>;
        kubernetesLogin(options?: Option): Promise<any>;
        awsIamLogin(options?: Option): Promise<any>;
        oktaLogin(options?: Option): Promise<any>;
        radiusLogin(options?: Option): Promise<any>;
        certLogin(options?: Option): Promise<any>;
        jwtLogin(options?: Option): Promise<any>;
        tokenAccessors(options?: Option): Promise<any>;
        tokenCreate(options?: Option): Promise<any>;
        tokenCreateOrphan(options?: Option): Promise<any>;
        tokenCreateRole(options?: Option): Promise<any>;
        tokenLookup(options?: Option): Promise<any>;
        tokenLookupAccessor(options?: Option): Promise<any>;
        tokenLookupSelf(options?: Option): Promise<any>;
        tokenRenew(options?: Option): Promise<any>;
        tokenRenewSelf(options?: Option): Promise<any>;
        tokenRevoke(options?: Option): Promise<any>;
        tokenRevokeAccessor(options?: Option): Promise<any>;
        tokenRevokeOrphan(options?: Option): Promise<any>;
        tokenRevokeSelf(options?: Option): Promise<any>;
        tokenRoles(options?: Option): Promise<any>;
        addTokenRole(options?: Option): Promise<any>;
        getTokenRole(options?: Option): Promise<any>;
        removeTokenRole(options?: Option): Promise<any>;
        addKubernetesRole(options?: Option): Promise<any>;
        getKubernetesRole(options?: Option): Promise<any>;
        deleteKubernetesRole(options?: Option): Promise<any>;
        approleRoles(options?: Option): Promise<any>;
        addApproleRole(options?: Option): Promise<any>;
        getApproleRole(options?: Option): Promise<any>;
        deleteApproleRole(options?: Option): Promise<any>;
        getApproleRoleId(options?: Option): Promise<any>;
        updateApproleRoleId(options?: Option): Promise<any>;
        getApproleRoleSecret(options?: Option): Promise<any>;
        approleSecretAccessors(options?: Option): Promise<any>;
        approleSecretLookup(options?: Option): Promise<any>;
        approleSecretDestroy(options?: Option): Promise<any>;
        approleSecretAccessorLookup(options?: Option): Promise<any>;
        approleSecretAccessorDestroy(options?: Option): Promise<any>;
        approleLogin(options?: Option): Promise<any>;
        health(options?: Option): Promise<any>;
        leader(options?: Option): Promise<any>;
        stepDown(options?: Option): Promise<any>;
        encryptData(options?: Option): Promise<any>;
        decryptData(options?: Option): Promise<any>;
        rewrapData(options?: Option): Promise<any>;
        transitCreateKey(options?: Option): Promise<any>;
        transitReadKey(options?: Option): Promise<any>;
        transitListKeys(options?: Option): Promise<any>;
        transitDeleteKey(options?: Option): Promise<any>;
        generateDatabaseCredentials(options?: Option): Promise<any>;
        destroySecretVersions(options?: Option): Promise<any>;
    }

    interface VaultOptions {
        debug?(...args: any[]): any;
        tv4?(...args: any[]): any;
        commands?: { [name: string]: functionConf };
        mustache?: any;
        "request-promise"?: any;
        Promise?: PromiseConstructor;

        apiVersion?: string;
        endpoint?: string;
        namespace?: string;
        noCustomHTTPVerbs?: boolean;
        pathPrefix?: string;
        token?: string;
        requestOptions?: AxiosRequestConfig & TlsOptions;
    }
}

declare function NodeVault(options?: NodeVault.VaultOptions): NodeVault.client;
export = NodeVault;
