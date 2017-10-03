export interface ISession
{
    authenticated: boolean;

    sessionId: string;
    privateToken: string;
    bearerToken: string;
}