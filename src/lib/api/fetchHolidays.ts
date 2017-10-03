import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { IHolidays } from '../IHolidays';

export interface IFetchHolidaysRequest
{
    session: ISession;
    registerId: number;
}

export interface IFetchHolidaysResponse
{
    holidays: IHolidays;
}

export function fetchHolidays(request: IFetchHolidaysRequest): Promise<IFetchHolidaysResponse>
{
    return new Promise<IFetchHolidaysResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/plan/WS_Plan.asmx/pobierzListeFerii')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${request.session.sessionId}; Bearer=${request.session.bearerToken}; .ASPXAUTH=${request.session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Plan.aspx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
            .send(`{'param' : {"strona":1,"iloscNaStrone":100,"iloscRekordow":-1,"kolumnaSort":"Data_od","kierunekSort":0,"maxIloscZaznaczonych":0,"panelFiltrow":0,"parametryFiltrow":null}, idP :'${request.registerId}' }`)
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
                        const parsedHolidays = parseHolidays(response.body.d);

                        resolve({
                            holidays: parsedHolidays
                        });
                    }
                    else
                    {
                        reject('err_request_not_ok');
                    }
                }
            });

        function parseHolidays(rawHolidays: any): IHolidays
        {
            const parsedHolidays: IHolidays = {
                data: []
            };

            rawHolidays.ListK.forEach(K =>
            {
                parsedHolidays.data.push({
                    from: new Date(K.data_od),
                    to: new Date(K.data_do),
                    name: K.nazwa,
                    id: K._recordId
                });
            });

            return parsedHolidays;
        }
    });
}