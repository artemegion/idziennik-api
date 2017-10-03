/// <reference types="request" />

declare module 'unirest'
{
    import * as request from 'request';

    interface IUnirest
    {
        (method: string): IRequestFunc;
        (method: string, url: string): unirest.IRequest;
        (method: string, url: string, headers: Object): unirest.IRequest;
        (method: string, url: string, headers: Object, body: any): unirest.IRequest;
        (method: string, url: string, headers: Object, body: any, callback: unirest.IRequestCallback): void;

        get: IRequestFunc;
        head: IRequestFunc;
        put: IRequestFunc;
        post: IRequestFunc;
        patch: IRequestFunc;
        delete: IRequestFunc;

        request: request.Request;

        jar(): unirest.ICookieJar;
        cookie(cookieString: string): any;
    }

    interface IRequestFunc
    {
        (url: string): unirest.IRequest;
        (url: string, headers: Object): unirest.IRequest;
        (url: string, headers: Object, body: any): unirest.IRequest;

        (url: string, callback: unirest.IRequestCallback): void;
        (url: string, headers: Object, callback: unirest.IRequestCallback): void;
        (url: string, headers: Object, body: any, callback: unirest.IRequestCallback): void;
    }

    namespace unirest
    {
        interface IRequest
        {
            auth(auth: {
                user: string,
                pass: string,
                sendImmediately?: boolean
            }): IRequest;
    
            auth(user: string, pass: string): IRequest;
            auth(user: string, pass: string, sendImmediately: boolean): IRequest;
    
            header(headers: Object): IRequest;
            header(header: string, value: string): IRequest;
    
            set(headers: Object): IRequest;
            set(header: string, value: string): IRequest;
    
            headers(headers: Object): IRequest;
            headers(header: string, value: string): IRequest;
    
            part(part: {
                'content-type': string,
                body: any
            }): IRequest;
    
            query(param: Object): IRequest;
            query(param: string): IRequest;
    
            send(body: Object): IRequest;
            send(body: string): IRequest;
    
            type(mimeType: string): IRequest;
    
            attach(attachment: Object)
            attach(name: string, path: string): IRequest;
    
            field(field: Object): IRequest;
            field(name: string, value: string): IRequest;
    
            stream(): IRequest;
    
            options: {
                url: string | Object;
                qs: Object;
                method: string;
                headers: Object;
                body: string | Object;
                form: Object;
                auth: Object;
                multipart: Object;
                followRedirect: boolean;
                followAllRedirects: boolean;
                maxRedirects: number;
                encoding: string;
                timeout: number;
                proxy: string;
                oauth: Object;
                hawk: Object;
                strictSSL: boolean;
                secureProtocol: string;
                jar: boolean | ICookieJar;
                aws: Object;
                httpSignature: Object;
                localAddress: string;
                pool: Object;
                forever: boolean;
            }
    
            url(url: string): IRequest;
    
            method(method: string): IRequest;
    
            form(fields: Object): IRequest;
    
            multipart(parts: {
                'content-type': string,
                body: any
            }[]): IRequest;
    
            maxRedirects(value: number): IRequest;
    
            redirects(value: number): IRequest;
    
            followRedirect(value: boolean): IRequest;
    
            redirect(value: boolean): IRequest;
    
            timeout(value: number): IRequest;
    
            encoding(value: string): IRequest;
    
            strictSSL(value: boolean): IRequest;
    
            ssl(value: boolean): IRequest;
    
            httpSignature(signature: Object): IRequest;
    
            proxy(proxy: string): IRequest;
    
            secureProtocol(protocol: string): IRequest;
    
            aws(credentials: Object): IRequest;
    
            oauth(credentials: Object): IRequest;
    
            hawk(options: Object): IRequest;
    
            localAddress(address: string): IRequest;
    
            ip(address: string): IRequest;
    
            jar(value: boolean): IRequest;
            jar(value: ICookieJar): IRequest;
    
            pool(value: Object): IRequest;
    
            forever(value: boolean): IRequest;
    
            end(callback: IRequestCallback): void;
    
            complete(callback: IRequestCallback): void;
    
            as: {
                json(callback: IRequestCallback): void;
                binary(callback: IRequestCallback): void;
                string(callback: IRequestCallback): void;
            };
        }
    
        interface IResponse
        {
            body: any;
            raw_body: any;
            headers: Object;
            cookies: Object;
            httpVersion: string;
            httpVersionMajor: string;
            httpVersionMinor: string;
            url: string;
            domain: string;
            method: string;
            client: Object;
            connection: Object;
            socket: Object;
            request: Object;
            setEncoding: (encoding: string) => void;
    
            code: number;
            status: number;
            statusType: 1 | 2 | 3 | 4 | 5;
            info: boolean;
            ok: boolean;
            clientError: boolean;
            serverError: boolean;
            accepted: boolean;
            noContent: boolean;
            badRequest: boolean;
            unauthorized: boolean;
            notAcceptable: boolean;
            notFound: boolean;
            forbidden: boolean;
            error: boolean | Object;
    
            cookie(name: string): string;
        }
    
        interface ICookieJar
        {
            add(cookie: ICookie): ICookie;
            getCookieString(): string;
            getCookies(): ICookie[];
            setCookie(cookieString: string): ICookie;
        }
    
        interface ICookie
        {
    
        }
    
    
        interface IRequestCallback
        {
            (response: IResponse): void;
        }
    }

    const unirest: IUnirest;
    export = unirest;
}