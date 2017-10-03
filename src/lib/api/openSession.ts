import * as unirest from 'unirest';

export interface IOpenSessionResponse
{
    sessionId: string;
    
    viewState: string;
    viewStateGenerator: string;
    eventValidation: string;
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
        .redirect(false)
        .jar(false)
        .encoding('UTF-8')
        .end((response) =>
        {
            if(response.error)
            {
                reject(response.error);
            }
            else
            {
                if(response.code === 200)
                {
                    let sessionId = response.cookie('ASP.NET_SessionId_iDziennik');
    
                    let viewState = /id="__VIEWSTATE".+value="(.+)"/gi.exec(response.body)[1];
                    let viewStateGenerator = /id="__VIEWSTATEGENERATOR".+value="(.+)"/gi.exec(response.body)[1];
                    let eventValidation = /id="__EVENTVALIDATION".+value="(.+)"/gi.exec(response.body)[1];
    
                    resolve({
                        sessionId: sessionId,
                        
                        viewState: viewState,
                        viewStateGenerator: viewStateGenerator,
                        eventValidation: eventValidation
                    });
                }
                else
                {
                    reject('err_request_not_ok');
                }
            }
        });
    });
}