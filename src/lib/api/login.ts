import * as unirest from 'unirest';
import { ICredentials } from '../ICredentials';
import { ISession } from '../ISession';
import { IAspxAuth } from '../IAspxAuth';

export interface ILoginRequest
{
    sessionId: string;
    credentials: ICredentials;
    aspxAuth: IAspxAuth;
}

export interface ILoginResponse
{
    authenticated: boolean;
}

export interface ILoginSuccessResponse extends ILoginResponse
{
    authenticated: boolean;

    privateToken: string;
    bearerToken: string;
}

export interface ILoginFailResponse extends ILoginResponse
{
    error: string;
}

export function login(request: ILoginRequest): Promise<ILoginResponse>
{
    return new Promise<ILoginResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/login.aspx')
            .headers({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'UTF-8',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': `NazwaSzkoly=${request.credentials.schoolName}; ASP.NET_SessionId_iDziennik=${request.sessionId}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/login.aspx',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Chrome/60 (Windows NT 10.0; Win64; x64) Mozilla/5.0 AppleWebKit/537 (KHTML, like Gecko) Safari/537'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
            .form({
                '__VIEWSTATE': request.aspxAuth.viewState,
                '__VIEWSTATEGENERATOR': request.aspxAuth.viewStateGenerator,
                '__EVENTVALIDATION': request.aspxAuth.eventValidation,
                'ctl00$ContentPlaceHolder$nazwaPrzegladarki': 'Chrome/60 Mozilla/5.0 AppleWebKit/537 (KHTML, like Gecko) Safari/537',
                'ctl00$ContentPlaceHolder$NazwaSzkoly': request.credentials.schoolName,
                'ctl00$ContentPlaceHolder$UserName': request.credentials.username,
                'ctl00$ContentPlaceHolder$Password': request.credentials.password,
                'ctl00$ContentPlaceHolder$captcha': request.credentials.captcha,
                'ctl00$ContentPlaceHolder$Logowanie': 'Zaloguj'
            })
            .end(response =>
            {
                if(response.error)
                {
                    reject(response.error);
                }
                else
                {
                    if(response.code === 200)
                    {
                        let spanErrorMessage = /id="spanErrorMessage".*?>(.+)</.exec(response.body)[1];

                        if(spanErrorMessage)
                        {
                            if(/kodu/.test(spanErrorMessage))
                            {
                                resolve({
                                    authenticated: false,
                                    error: 'captcha'
                                } as ILoginFailResponse);
                            }
                            else if(/hasło/.test(spanErrorMessage))
                            {
                                resolve({
                                    authenticated: false,
                                    error: 'credentials'
                                } as ILoginFailResponse);
                            }
                            else if(/szkoły/.test(spanErrorMessage))
                            {
                                resolve({
                                    authenticated: false,
                                    error: 'schoolName'
                                } as ILoginFailResponse);
                            }
                            else
                            {
                                resolve({
                                    authenticated: false,
                                    error: 'unknown'
                                } as ILoginFailResponse);
                            }
                        }
                        else
                        {
                            reject('err_no_error_message');
                        }
                    }
                    else if(response.code >= 300 && response.code <= 305)
                    {
                        let privateToken = response.cookie('.ASPXAUTH');
                        let bearerToken = response.cookie('Bearer');

                        resolve({
                            authenticated: true,
                            bearerToken: bearerToken,
                            privateToken: privateToken
                        } as ILoginSuccessResponse);
                    }
                    else
                    {
                        reject('err_unknown_error');
                    }
                }
            });
    });
}