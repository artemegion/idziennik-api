import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { ISchedule } from '../ISchedule';

export function fetchSchedule(session: ISession, registerId: number, date: Date, yearId: number): Promise<ISchedule>
{
    return new Promise<ISchedule>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/plan/WS_Plan.asmx/pobierzPlanZajec')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'UTF-8',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${session.sessionId}; Bearer=${session.bearerToken}; .ASPXAUTH=${session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Plan.aspx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .type('application/json')
            .encoding('UTF-8')
            .redirect(false)
            .jar(false)
            .send(`{data: "${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T22:00:00.000Z", idPozDziennika: "${registerId}", pidRokSzkolny: ${yearId}}`)
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
                        resolve(parseSchedule(response.body.d));
                    }
                    else
                    {
                        reject(new Error(`Could not fetch schedule (response status ${response.status})`));
                    }
                }
            });

        function parseSchedule(rawSchedule: any): ISchedule
        {
            const parsedSchedule: ISchedule = {
                lessonsTimeFrames: [],
                days: {
                    1: [],
                    2: [],
                    3: [],
                    4: [],
                    5: []
                }
            };

            rawSchedule.GodzinyLekcyjne.forEach(Godzina =>
            {
                parsedSchedule.lessonsTimeFrames.push({
                    index: Godzina.LiczbaP,
                    from: Godzina.Poczatek,
                    to: Godzina.Koniec
                });
            });

            rawSchedule.Przedmioty.forEach(Przedmiot =>
            {
                parsedSchedule.days[Przedmiot.DzienTygodnia].push({
                    index: Przedmiot.Godzina,
                    id: Przedmiot.Id,
                    color: Przedmiot.Kolor,
                    teacher: Przedmiot.Nauczyciel,
                    name: Przedmiot.Nazwa,
                    description: Przedmiot.OpisPrzyczyna,
                    replacementType: Przedmiot.TypZastepstwa,
                    classesCancelled: Przedmiot.ZajeciaOdwolane
                });
            });

            return parsedSchedule;
        }
    });
}