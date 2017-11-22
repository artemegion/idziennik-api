import * as unirest from 'unirest';
import { IAspxAuth } from '../IAspxAuth';

export interface IOpenSessionResponse
{
    sessionId: string;
    aspxAuth: IAspxAuth;
}

export function openSession(): Promise<IOpenSessionResponse>
{
    return new Promise<IOpenSessionResponse>((resolve, reject) =>
    {
        unirest.get('https://iuczniowie.progman.pl/idziennik/login.aspx')
            .headers({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'UTF-8',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Cookie': '',
                'Host': 'iuczniowie.progman.pl',
                'Upgrade-Insecure-Request': '1',
                'User-Agent': 'Chrome/60 (Windows NT 10.0; Win64; x64) Mozilla/5.0 AppleWebKit/537 (KHTML, like Gecko) Safari/537'
            })
            .encoding('UTF-8')
            .redirect(false)
            .jar(false)
            .end(response =>
            {
                if (response.error)
                {
                    reject(response.error);
                }
                else
                {
                    if (response.status === 200)
                    {
                        let sessionId = response.cookie('ASP.NET_SessionId_iDziennik');

                        let viewState = /id="__VIEWSTATE".*value="(.*)"/.exec(response.body);
                        let viewStateGenerator = /id="__VIEWSTATEGENERATOR".*value="(.*)"/.exec(response.body);
                        let eventValidation = /id="__EVENTVALIDATION".*value="(.*)"/.exec(response.body);

                        if (viewState === null || viewState[1] === null || viewStateGenerator === null || viewStateGenerator[1] === null
                            || eventValidation === null || eventValidation[1] === null)
                        {
                            reject('Could not open session (ASP.NET auth form fields are empty)');
                        }
                        else
                        {
                            resolve({
                                sessionId: sessionId,

                                aspxAuth: {
                                    viewState: viewState[1],
                                    viewStateGenerator: viewStateGenerator[1],
                                    eventValidation: eventValidation[1]
                                }
                            });
                        }
                    }
                    else
                    {
                        reject(new Error(`Could not open session (response status ${response.status})`));
                    }
                }
            });
    });
}