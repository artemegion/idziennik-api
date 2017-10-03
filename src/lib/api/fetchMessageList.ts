import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { IMessageList } from '../IMessageList';

export interface IFetchMessageListRequest
{
    session: ISession;
}

export interface IFetchMessageListResponse
{
    messageList: IMessageList;
}

export function fetchMessageList(request: IFetchMessageListRequest): Promise<IFetchMessageListResponse>
{
    return new Promise<IFetchMessageListResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_komunikator/WS_wiadomosci.asmx/PobierzListeWiadomosci')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${request.session.sessionId}; Bearer=${request.session.bearerToken}; .ASPXAUTH=${request.session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Komunikator.aspx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.91 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
            .send(`{'param' : {"strona":1,"iloscNaStrone":30,"iloscRekordow":-1,"kolumnaSort":"Data_nadania","kierunekSort":1,"maxIloscZaznaczonych":0,"panelFiltrow":1,"parametryFiltrow":[{"idKolumny":"w.Typ_wiadomosci","paramWartosc":"0"}]} }`)
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
                        const parsedMessageList = parseMessageList(response.body.d);

                        resolve({
                            messageList: parsedMessageList
                        });
                    }
                    else
                    {
                        reject('err_request_not_ok');
                    }
                }
            });

        function parseMessageList(rawMessageList: any): IMessageList
        {
            const parsedMessageList: IMessageList = {
                data: []
            };

            rawMessageList.ListK.forEach(K =>
            {
                parsedMessageList.data.push({
                    id: K._recordId,
                    postDate: new Date(K.DataNadania),
                    sender: K.Nadawca,
                    senderId: K._idNadawcy,
                    title: K.Tytul
                });
            });

            return parsedMessageList;
        }
    });
}