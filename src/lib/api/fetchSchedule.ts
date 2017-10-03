import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { ISchedule } from '../ISchedule';

export interface IFetchScheduleRequest
{
    session: ISession;
    registerId: number;
    date: Date;
    yearId: number;
}

export interface IFetchScheduleResponse
{
    schedule: ISchedule;
}

export function fetchSchedule(request: IFetchScheduleRequest): Promise<IFetchScheduleResponse>
{
    return new Promise<IFetchScheduleResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/plan/WS_Plan.asmx/pobierzPlanZajec')
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
            .send(`{data: "${request.date.getFullYear()}-${request.date.getMonth()}-${request.date.getDate()}T22:00:00.000Z", idPozDziennika: "${request.registerId}", pidRokSzkolny: ${request.yearId}}`)
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
                        const parsedSchedule = parseSchedule(response.body.d);

                        resolve({
                            schedule: parsedSchedule
                        });
                    }
                    else
                    {
                        reject('err_request_not_ok');
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
                    id: Godzina.LiczbaP,
                    from: Godzina.Poczatek,
                    to: Godzina.Koniec
                });
            });

            rawSchedule.Przedmioty.forEach(Przedmiot =>
            {
                parsedSchedule.days[Przedmiot.DzienTygodnia].push({
                    lessonId: Przedmiot.Godzina,
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