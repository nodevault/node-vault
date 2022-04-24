// Type definitions for vaultaire
// Project: https://github.com/vaultaire/vaultaire
// Definitions by: Jianrong Yu <https://github.com/YuJianrong>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace NodeVault {
    interface Option {
        [p: string]: unknown;
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

    interface client {
        handleVaultResponse(res?: { statusCode: number, request: Option, body: unknown }): Promise<unknown>;
        apiVersion: string;
        endpoint: string;
        token: string;

        request(requestOptions: RequestOption): Promise<unknown>;

        help(path: string, requestOptions?: Option): Promise<unknown>;
        write(path: string, data: unknown, requestOptions?: Option): Promise<unknown>;
        read(path: string, requestOptions?: Option): Promise<unknown>;
        list(path: string, requestOptions?: Option): Promise<unknown>;
        delete(path: string, requestOptions?: Option): Promise<unknown>;

        generateFunction(name: string, conf: functionConf): void;

        status(options?: Option): Promise<unknown>;
        initialized(options?: Option): Promise<unknown>;
        init(options?: Option): Promise<unknown>;
        unseal(options?: Option): Promise<unknown>;
        seal(options?: Option): Promise<unknown>;
        generateRootStatus(options?: Option): Promise<unknown>;
        generateRootInit(options?: Option): Promise<unknown>;
        generateRootCancel(options?: Option): Promise<unknown>;
        generateRootUpdate(options?: Option): Promise<unknown>;
        mounts(options?: Option): Promise<unknown>;
        mount(options?: Option): Promise<unknown>;
        unmount(options?: Option): Promise<unknown>;
        remount(options?: Option): Promise<unknown>;
        policies(options?: Option): Promise<unknown>;
        addPolicy(options?: Option): Promise<unknown>;
        getPolicy(options?: Option): Promise<unknown>;
        removePolicy(options?: Option): Promise<unknown>;
        auths(options?: Option): Promise<unknown>;
        enableAuth(options?: Option): Promise<unknown>;
        disableAuth(options?: Option): Promise<unknown>;
        audits(options?: Option): Promise<unknown>;
        enableAudit(options?: Option): Promise<unknown>;
        disableAudit(options?: Option): Promise<unknown>;
        renew(options?: Option): Promise<unknown>;
        revoke(options?: Option): Promise<unknown>;
        revokePrefix(options?: Option): Promise<unknown>;
        rotate(options?: Option): Promise<unknown>;
        gcpLogin(options?: Option): Promise<unknown>;
        githubLogin(options?: Option): Promise<unknown>;
        userpassLogin(options?: Option): Promise<unknown>;
        kubernetesLogin(options?: Option): Promise<unknown>;
        awsIamLogin(options?: Option): Promise<unknown>;
        ldapLogin(options?: Option): Promise<unknown>;
        oktaLogin(options?: Option): Promise<unknown>;
        radiusLogin(options?: Option): Promise<unknown>;
        tokenAccessors(options?: Option): Promise<unknown>;
        tokenCreate(options?: Option): Promise<unknown>;
        tokenCreateOrphan(options?: Option): Promise<unknown>;
        tokenCreateRole(options?: Option): Promise<unknown>;
        tokenLookup(options?: Option): Promise<unknown>;
        tokenLookupAccessor(options?: Option): Promise<unknown>;
        tokenLookupSelf(options?: Option): Promise<unknown>;
        tokenRenew(options?: Option): Promise<unknown>;
        tokenRenewSelf(options?: Option): Promise<unknown>;
        tokenRevoke(options?: Option): Promise<unknown>;
        tokenRevokeAccessor(options?: Option): Promise<unknown>;
        tokenRevokeOrphan(options?: Option): Promise<unknown>;
        tokenRevokeSelf(options?: Option): Promise<unknown>;
        tokenRoles(options?: Option): Promise<unknown>;
        addTokenRole(options?: Option): Promise<unknown>;
        getTokenRole(options?: Option): Promise<unknown>;
        removeTokenRole(options?: Option): Promise<unknown>;
        approleRoles(options?: Option): Promise<unknown>;
        addApproleRole(options?: Option): Promise<unknown>;
        getApproleRole(options?: Option): Promise<unknown>;
        deleteApproleRole(options?: Option): Promise<unknown>;
        getApproleRoleId(options?: Option): Promise<unknown>;
        updateApproleRoleId(options?: Option): Promise<unknown>;
        getApproleRoleSecret(options?: Option): Promise<unknown>;
        approleSecretAccessors(options?: Option): Promise<unknown>;
        approleSecretLookup(options?: Option): Promise<unknown>;
        approleSecretDestroy(options?: Option): Promise<unknown>;
        approleSecretAccessorLookup(options?: Option): Promise<unknown>;
        approleSecretAccessorDestroy(options?: Option): Promise<unknown>;
        approleLogin(options?: Option): Promise<unknown>;
        health(options?: Option): Promise<unknown>;
        leader(options?: Option): Promise<unknown>;
        stepDown(options?: Option): Promise<unknown>;
        encryptData(options?: Option): Promise<unknown>;
        decryptData(options?: Option): Promise<unknown>;
        generateDatabaseCredentials(options?: Option): Promise<unknown>;
    }

    interface VaultOptions {
        debug?(...args: unknown[]): unknown;
        tv4?(...args: unknown[]): unknown;
        commands?: Array<{ method: string, path: string, scheme: unknown }>;
        mustache?: unknown;
        "request-promise"?: unknown;
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
