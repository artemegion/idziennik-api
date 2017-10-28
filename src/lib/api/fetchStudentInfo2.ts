import * as unirest from 'unirest';
import { ISession } from '../ISession';
import { IStudentInfo } from '../IStudentInfo';
import { IAspxAuth } from '../IAspxAuth';

export function fetchStudentInfo(session: ISession): Promise<IStudentInfo>
{
    return getStudentInfoPage(session);
}

function getStudentInfoPage(session: ISession): Promise<IStudentInfo>
{
    return new Promise<IStudentInfo>((resolve, reject) =>
    {
        unirest.get('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Sprawdziany.aspx')
        .headers({
            'Accept': 'text/html',
            'Accept-Encoding': 'UTF-8',
            'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Cookie': `ASP.NET_SessionId_iDziennik=${session.sessionId}; Bearer=${session.bearerToken}; .ASPXAUTH=${session.privateToken}`,
            'Host': 'iuczniowie.progman.pl',
            'Upgrade-Insecure-Request': '1',
            'User-Agent': 'Chrome/60 (Windows NT 10.0; Win64; x64) Mozilla/5.0 AppleWebKit/537 (KHTML, like Gecko) Safari/537'
        })
        .encoding('UTF-8')
        .redirect(false)
        .jar(false)
        .end(response =>
        {
            if(response.error)
            {
                reject(response.error);
            }
            else
            {
                if(response.status === 200)
                {
                    let dxComboUczniowie = /id="ctl00_dxComboUczniowie".*(?:\n|\r|\r\n|\n\r)?.*value="(.*)">(.*)\ \((.*),/.exec(response.body);
                    let dxComboRokSzkolny = /id="ctl00_dxComboRokSzkolny".*>(?:(?:\n|\r|\r\n|\n\r).+)+>/.exec(response.body);

                    let dxComboRokSzkolnyOptionRegex = /<option.*value="(.*)">(.*)</g;
                    let dxComboRokSzkolnyOption;

                    let studentInfo: IStudentInfo = {
                        classId: dxComboUczniowie[3],
                        name: dxComboUczniowie[2],

                        years: []
                    };

                    do
                    {
                        dxComboRokSzkolnyOption = dxComboRokSzkolnyOptionRegex.exec(dxComboRokSzkolny[0]);

                        if(dxComboRokSzkolnyOption !== null)
                        {
                            let yearId = Number.parseInt(dxComboRokSzkolnyOption[1]);
                            let yearName = dxComboRokSzkolnyOption[2];

                            studentInfo.years.push({
                                id: yearId,
                                name: yearName,
                                registerId: null
                            });
                        }
                    }
                    while(dxComboRokSzkolnyOption);

                    studentInfo.years = [...studentInfo.years].reverse();
                    studentInfo.years[0].registerId = Number.parseInt(dxComboUczniowie[1]);

                    let aspxAuth: IAspxAuth = {
                        viewState: /id="__VIEWSTATE".*value="(.*)"/.exec(response.body)[1],
                        viewStateGenerator: /id="__VIEWSTATEGENERATOR".*value="(.*)"/.exec(response.body)[1],
                        eventValidation: /id="__EVENTVALIDATION".*value="(.*)"/.exec(response.body)[1]
                    };

                    let promise = Promise.resolve();
                    for(let i = 1; i < studentInfo.years.length; i++)
                    {
                        promise = promise.then(() => postStudentInfoPage(session, aspxAuth, studentInfo.years[i - 1].registerId, studentInfo.years[i].id)
                        .then(p =>
                        {
                            aspxAuth = p.aspxAuth;
                            studentInfo.years[i].registerId = p.registerId; 
                        }));
                    }

                    promise.then(() => resolve(studentInfo));
                }
                else
                {
                    reject(new Error(`Could not fetch student info (response status ${response.status})`));
                }
            }
        });
    });
}

function postStudentInfoPage(session: ISession, aspxAuth: IAspxAuth, dxComboUczniowie: number, yearId: number): Promise<{ registerId: number, aspxAuth: IAspxAuth }>
{
    return new Promise<{ registerId: number, aspxAuth: IAspxAuth }>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Sprawdziany.aspx')
        .headers({
            'Accept': 'text/html',
            'Accept-Encoding': 'UTF-8',
            'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': `ASP.NET_SessionId_iDziennik=${session.sessionId}; Bearer=${session.bearerToken}; .ASPXAUTH=${session.privateToken}`,
            'Encoding': 'UTF-8',
            'Host': 'iuczniowie.progman.pl',
            'Origin': 'https://iuczniowie.progman.pl',
            'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Oceny.aspx',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537'
        })
        .type('application/x-www-form-urlencoded')
        .encoding('UTF-8')
        .redirect(false)
        .jar(false)
        .form({
            '__EVENTTARGET': 'ctl00$dxComboRokSzkolny',
            '__EVENTARGUMENT': '',
            '__LASTFOCUS': '',
            '__VIEWSTATE': aspxAuth.viewState,
            '__VIEWSTATEGENERATOR': aspxAuth.viewStateGenerator,
            '__EVENTVALIDATION': aspxAuth.eventValidation,
            'ctl00$dxComboUczniowie': dxComboUczniowie,
            'ctl00$dxComboRokSzkolny': yearId,
            'ctl00$dxComboSemestr': '0',
            'ctl00$rodzajDziennika': 'Tradycyjne',
            'ctl00$czyPunktoweUwagi': 'False',
            'ctl00$CzyRodzic': '0'
        })
        .end(response =>
        {
            if(response.error)
            {
                reject(response.error);
            }
            else
            {
                if(response.status === 200)
                {
                    try
                    {
                        var registerId = Number.parseInt(/id="ctl00_dxComboUczniowie".*(?:\n|\r|\r\n|\n\r)?.*value="(.*)">/.exec(response.body)[1]);
                    }
                    catch(error)
                    {
                        reject(error);
                    }

                    let aspxAuth: IAspxAuth = {
                        viewState: /id="__VIEWSTATE".*value="(.*)"/.exec(response.body)[1],
                        viewStateGenerator: /id="__VIEWSTATEGENERATOR".*value="(.*)"/.exec(response.body)[1],
                        eventValidation: /id="__EVENTVALIDATION".*value="(.*)"/.exec(response.body)[1]
                    };

                    resolve({
                        registerId: registerId,
                        aspxAuth: aspxAuth
                    });
                }
                else
                {
                    reject(new Error(`Could not fetch registerId for yearId ${yearId} (response status ${response.status})`));
                }
            }
        });
    });
}