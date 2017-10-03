import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { ISettings } from '../ISettings';

export interface IFetchSettingsRequest
{
    session: ISession;
}

export interface IFetchSettingsResponse
{
    settings: ISettings;
}

export function fetchSettings(request: IFetchSettingsRequest): Promise<IFetchSettingsResponse>
{
    return new Promise<IFetchSettingsResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/ustawienia/WS_ustawienia.asmx/PobierzUstawienia')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${request.session.sessionId}; Bearer=${request.session.bearerToken}; .ASPXAUTH=${request.session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Ustawienia.aspx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
            .send('{}')
            .end(response =>
            {
                if (response.error)
                {
                    reject(response.error);
                }
                else
                {
                    if (response.code === 200)
                    {
                        const parsedSettings = parseSettings(response.body.d);

                        resolve({
                            settings: parsedSettings
                        })
                    }
                    else
                    {
                        reject('err_request_not_ok');
                    }
                }
            });

        function parseSettings(rawSettings: any): ISettings
        {
            const parsedSettings: ISettings = {
                id: rawSettings.Ustawienia.Id,
                email: {
                    announcements: rawSettings.Ustawienia.Komunikaty,
                    grades: rawSettings.Ustawienia.Oceny,
                    tests: rawSettings.Ustawienia.Sprawdziany,
                    notices: rawSettings.Ustawienia.Uwagi
                }
            };

            return parsedSettings;
        }
    });
}