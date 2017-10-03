import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { ITests } from '../ITests';

export interface IFetchTestsRequest
{
    session: ISession;
    registerId: number;
    month: number;
    year: number;
}

export interface IFetchTestsResponse
{
    tests: ITests;
}

export function fetchTests(request: IFetchTestsRequest): Promise<IFetchTestsResponse>
{
    return new Promise<IFetchTestsResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/sprawdziany/mod_sprawdzianyPanel.asmx/pobierzListe')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${request.session.sessionId}; Bearer=${request.session.bearerToken}; .ASPXAUTH=${request.session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Sprawdziany.aspx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
            .send(`{'param' : {"strona":1,"iloscNaStrone":30,"iloscRekordow":-1,"kolumnaSort":"ss.Nazwa,sp.Data_sprawdzianu","kierunekSort":0,"maxIloscZaznaczonych":0,"panelFiltrow":0,"parametryFiltrow":null}, idP: '${request.registerId}' , miesiac : '${request.month}', rok: '${request.year}'}`)
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
                        const parsedTests = parseTests(response.body.d);

                        resolve({
                            tests: parsedTests
                        });
                    }
                    else
                    {
                        reject('err_request_not_ok');
                    }
                }
            });

        function parseTests(rawTests: any): ITests
        {
            const parsedTests: ITests = {
                data: []
            };

            rawTests.ListK.forEach(K =>
            {
                parsedTests.data.push({
                    date: K.data,
                    dayOfWeek: K.dzienTyg,
                    subject: K.przedmiot,
                    kind: K.rodzaj,
                    issuedBy: K.wpisal,
                    scope: K.zakres,
                    id: K._recordId
                });
            });

            return parsedTests;
        }
    });
}