import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { IAttendance } from '../IAttendance';

export function fetchAttendance(session: ISession, registerId: number, date: Date, fetchFullMonth: boolean): Promise<IAttendance>
{
    return new Promise<IAttendance>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/obecnosci/WS_obecnosciUcznia.asmx/pobierzObecnosciUcznia')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'UTF-8',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${session.sessionId}; Bearer=${session.bearerToken}; .ASPXAUTH=${session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Obecnosci.aspx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .type('application/json')
            .encoding('UTF-8')
            .redirect(false)
            .jar(false)
            .send(`{idPozDziennika: ${registerId}, mc: ${date.getMonth()}, rok: ${date.getFullYear()}, dataTygodnia: ${fetchFullMonth ? 'null' : `'${date.getFullYear()}-${date.getMonth()}-${date.getDate()}'`}`)
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
                        resolve(parseAttendance(response.body.d));
                    }
                    else
                    {
                        reject(new Error(`Could not fetch attendance (response status ${response.status}`));
                    }
                }
            });
    });

    function parseAttendance(rawAttendance: any): IAttendance
    {
        const parsedAttendance: IAttendance = {
            statistics: {
                cancelled: rawAttendance.Statystyki.ileBrakZajec,
                holidays: rawAttendance.Statystyki.ileFerii,
                absence: rawAttendance.Statystyki.ileNieobecnosci,
                presence: rawAttendance.Statystyki.ileObecnosci,
                late: rawAttendance.Statystyki.ileSpoznien,
                excuse: rawAttendance.Statystyki.ileUsprawiedliwien,
                trip: rawAttendance.Statystyki.ileWycieczek,
                exempt: rawAttendance.Statystyki.ileZwolnien,
                exemptPresent: rawAttendance.Statystyki.ileZwolnionyObecny
            },
    
            days: []
        };
    
        rawAttendance.Obecnosci.forEach(Obecnosc =>
        {
            parsedAttendance.days.push({
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