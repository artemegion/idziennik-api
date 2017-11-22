import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { ITest } from '../ITest';

export function fetchTests(session: ISession, registerId: number, month: number, year: number): Promise<ITest[]>
{
    return new Promise<ITest[]>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/sprawdziany/mod_sprawdzianyPanel.asmx/pobierzListe')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'UTF-8',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${session.sessionId}; Bearer=${session.bearerToken}; .ASPXAUTH=${session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Sprawdziany.aspx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .type('application/json')
            .encoding('UTF-8')
            .redirect(false)
            .jar(false)
            .send(`{'param' : {"strona":1,"iloscNaStrone":30,"iloscRekordow":-1,"kolumnaSort":"ss.Nazwa,sp.Data_sprawdzianu","kierunekSort":0,"maxIloscZaznaczonych":0,"panelFiltrow":0,"parametryFiltrow":null}, idP: '${registerId}' , miesiac : '${month}', rok: '${year}'}`)
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
                        resolve(parseTests(response.body.d));
                    }
                    else
                    {
                        reject(new Error(`Could not fetch tests (response status ${response.status})`));
                    }
                }
            });

        function parseTests(rawTests: any): ITest[]
        {
            const parsedTests: ITest[] = [];

            rawTests.ListK.forEach(K =>
            {
                parsedTests.push({
                    date: new Date(K.data),
                    dayOfWeek: K.dzienTyg,
                    subject: K.przedmiot,
                    type: K.rodzaj,
                    issuedBy: K.wpisal,
                    scope: K.zakres,
                    id: K._recordId
                });
            });

            return parsedTests;
        }
    });
}