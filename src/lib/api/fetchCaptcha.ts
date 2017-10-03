import * as unirest from 'unirest';

export interface IFetchCaptchaRequest
{
    sessionId: string;
}

export interface IFetchCaptchaResponse
{
    captchaBase64: string;
}

export function fetchCaptcha(request: IFetchCaptchaRequest): Promise<IFetchCaptchaResponse>
{
    return new Promise<IFetchCaptchaResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/ws_czynnosciadm.asmx/GetCaptacha')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'UTF-8',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${request.sessionId}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/login.aspx',
                'User-Agent': 'Chrome/60 (Windows NT 10.0; Win64; x64) Mozilla/5.0 AppleWebKit/537 (KHTML, like Gecko) Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
            .send({})
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
                        resolve({
                            captchaBase64: response.body.d
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