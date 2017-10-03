import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { IStudentInfo } from '../IStudentInfo';

export interface IFetchStudentInfoRequest
{
    session: ISession;
}

export interface IFetchStudentInfoResponse
{
    studentInfo: IStudentInfo;
}

export function fetchStudentInfo(request: IFetchStudentInfoRequest): Promise<IFetchStudentInfoResponse>
{
    return new Promise<IFetchStudentInfoResponse>((resolve, reject) =>
    {
        unirest.get('https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Sprawdziany.aspx')
            .headers({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'UTF-8',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Cookie': `ASP.NET_SessionId_iDziennik=${request.session.sessionId}; Bearer=${request.session.bearerToken}; .ASPXAUTH=${request.session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Upgrade-Insecure-Request': '1',
                'User-Agent': 'Chrome/60 (Windows NT 10.0; Win64; x64) Mozilla/5.0 AppleWebKit/537 (KHTML, like Gecko) Safari/537'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
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
                        const parsedStudentInfo = parseStudentInfo(response.body);

                        resolve({
                            studentInfo: parsedStudentInfo
                        });
                    }
                    else
                    {
                        reject('err_request_not_ok');
                    }
                }
            });

        function parseStudentInfo(body: any): IStudentInfo
        {
            let infoRegexResults = /id="ctl00_dxComboUczniowie".*\n.*?value="(.+)".*?>(.+)\ \((.+),/.exec(body);

            let parsedStudentInfo = {
                name: infoRegexResults[2],
                classId: infoRegexResults[3],
                registerId: Number.parseInt(infoRegexResults[1]),
                years: []
            };


            var extractOptionsFromYearsCombo = /id="ctl00_dxComboRokSzkolny".+>((?:\n.+)+)/; // extracts HTML of <option> elements contained in years combo
            var extractValuesFromYearsComboOption = /<option.*?value="(.+)".*?>(.+)</g;

            let yearsComboOptions = extractOptionsFromYearsCombo.exec(body)[0];

            let yearsComboOptionValues;
            while ((yearsComboOptionValues = extractValuesFromYearsComboOption.exec(yearsComboOptions)) !== null)
            {
                parsedStudentInfo.years.push({
                    id: Number.parseInt(yearsComboOptionValues[1]),
                    name: yearsComboOptionValues[2]
                });
            }

            return parsedStudentInfo;
        }
    });
}