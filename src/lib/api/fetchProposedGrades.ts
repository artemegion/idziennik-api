import * as unirest from 'unirest';

import { IProposedGrades } from '../IProposedGrades';
import { ISession } from '../ISession';

export interface IFetchProposedGradesRequest
{
    session: ISession;
    registerId: number;
}

export interface IFetchProposedGradesResponse
{
    proposedGrades: IProposedGrades;
}

export function fetchProposedGrades(request: IFetchProposedGradesRequest): Promise<IFetchProposedGradesResponse>
{
    return new Promise<IFetchProposedGradesResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/brak_ocen/WS_BrakOcenUcznia.asmx/pobierzBrakujaceOcenyUcznia')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${request.session.sessionId}; Bearer=${request.session.bearerToken}; .ASPXAUTH=${request.session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/BrakOcen.aspx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
            .send(`{idPozDziennika: ${request.registerId}}`)
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
                        const parsedProposedGrades = parseProposedGrades(response.body.d);

                        resolve({
                            proposedGrades: parsedProposedGrades
                        });
                    }
                    else
                    {
                        reject('err_request_not_ok');
                    }
                }
            });

        function parseProposedGrades(rawProposedGrades: any): IProposedGrades
        {
            const parsedProposedGrades: IProposedGrades = {
                semestersCount: rawProposedGrades.IloscSemestrow,
                subjects: []
            };

            rawProposedGrades.Przedmioty.forEach(Przedmiot =>
            {
                let parsedSubject = {
                    name: Przedmiot.Przedmiot,
                    semesters: {}
                };

                for (let i = 1; i <= parsedProposedGrades.semestersCount; i++)
                {
                    parsedSubject.semesters[i] = Przedmiot[`OcenaSem${i}`];
                }

                parsedProposedGrades.subjects.push(parsedSubject);
            });

            return parsedProposedGrades;
        }
    });
}