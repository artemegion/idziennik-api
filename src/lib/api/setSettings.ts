import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { ISettings } from '../ISettings';

export interface ISetSettingsRequest
{
    session: ISession;
    settings: ISettings;
}

export interface ISetSettingsResponse
{
    ok: boolean;
}

export function setSettings(request: ISetSettingsRequest): Promise<ISetSettingsResponse>
{
    return new Promise<ISetSettingsResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/ustawienia/WS_ustawienia.asmx/ZapiszUstawienia')
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/6- Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
            .send(`{ustaw:{"__type":"mds.Web.mod_panelRodzica.ustawienia.WS_ustawienia+dUst","Id":${request.settings.id},"Komunikaty":${request.settings.email.announcements},"Oceny":${request.settings.email.grades},"Uwagi":${request.settings.email.notices},"Sprawdziany":${request.settings.email.tests}}}`)
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
                            ok: true
                        });
                    }
                    else
                    {
                        resolve({
                            ok: false
                        })
                    }
                }
            });
    });
}