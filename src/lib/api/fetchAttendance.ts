import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { IAttendance, IAttendanceStatistics } from '../IAttendance';

export interface IFetchAttendanceResponse
{
    attendance: IAttendance;
}

export interface IFetchAttendanceRequest
{
    session: ISession;
    registerId: number;

    date: Date;
    fetchFullMonth: boolean;
}

export function fetchAttendance(request: IFetchAttendanceRequest): Promise<IFetchAttendanceResponse>
{
    return new Promise<IFetchAttendanceResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/obecnosci/WS_obecnosciUcznia.asmx/pobierzObecnosciUcznia')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${request.session.sessionId}; Bearer=${request.session.bearerToken}; .ASPXAUTH=${request.session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Obecnosci.aspx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
            .send(`{idPozDziennika: ${request.registerId}, mc: ${request.date.getMonth()}, rok: ${request.date.getFullYear()}, dataTygodnia: ${request.fetchFullMonth ? 'null' : `'${request.date.getFullYear()}-${request.date.getMonth()}-${request.date.getDate()}'`}`)
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
                        const parsedAttendance = parseAttendance(response.body.d);

                        resolve({
                            attendance: parsedAttendance
                        });
                    }
                    else
                    {
                        reject('err_request_not_ok');
                    }
                }
            });
    });

    function parseAttendance(rawAttendance: any): IAttendance
    {
        const parsedAttendance: IAttendance = {
            statistics: {
                cancelled: rawAttendance.Statystyki.ileBrakZajec,
                holiday: rawAttendance.Statystyki.ileFerii,
                absence: rawAttendance.Statystyki.ileNieobecnosci,
                presence: rawAttendance.Statystyki.ileObecnosci,
                late: rawAttendance.Statystyki.ileSpoznien,
                excuse: rawAttendance.Statystyki.ileUsprawiedliwien,
                trip: rawAttendance.Statystyki.ileWycieczek,
                exempt: rawAttendance.Statystyki.ileZwolnien,
                exemptPresent: rawAttendance.Statystyki.ileZwolnionyObecny
            },
    
            entries: []
        };
    
        rawAttendance.Obecnosci.forEach(Obecnosc =>
        {
            parsedAttendance.entries.push({
                classesDate: new Date(Obecnosc.Data.split(' ')[0]),
                classesTimeSpan: Obecnosc.OdDoGodziny,
                classesIndex: Obecnosc.Godzina,
                classesTopic: Obecnosc.PrzedmiotTemat,

                type: Obecnosc.TypObecnosci,
                wasEdited: Obecnosc.Historia,

                teacher: Obecnosc.PrzedmiotNauczyciel,
                subject: Obecnosc.Przedmiot,
            });
        });
    
        return parsedAttendance;
    }
}