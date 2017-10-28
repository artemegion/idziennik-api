import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { IMessage } from '../IMessage';

export function fetchMessageList(session: ISession, quantityPerPage: number, page: number): Promise<IMessage[]>
{
    return new Promise<IMessage[]>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_komunikator/WS_wiadomosci.asmx/PobierzListeWiadomosci')
            .headers({
                'Accept': 'application/json, text/javascript, */*',
                'Accept-Encoding': 'UTF-8',
                'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4,de;q=0.2,und;q=0.2',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': `ASP.NET_SessionId_iDziennik=${session.sessionId}; Bearer=${session.bearerToken}; .ASPXAUTH=${session.privateToken}`,
                'Host': 'iuczniowie.progman.pl',
                'Origin': 'https://iuczniowie.progman.pl',
                'Referer': 'https://iuczniowie.progman.pl/idziennik/mod_panelRodzica/Komunikator.aspx',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.91 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .type('application/json')
            .encoding('UTF-8')
            .redirect(false)
            .jar(false)
            .send(`{'param' : {"strona":${page},"iloscNaStrone":${quantityPerPage},"iloscRekordow":-1,"kolumnaSort":"Data_nadania","kierunekSort":1,"maxIloscZaznaczonych":0,"panelFiltrow":1,"parametryFiltrow":[{"idKolumny":"w.Typ_wiadomosci","paramWartosc":"0"}]} }`)
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
                        resolve(parseMessages(response.body.d));
                    }
                    else
                    {
                        reject(new Error(`Could not fetch message list (response status ${response.status})`));
                    }
                }
            });

        function parseMessages(rawMessages: any): IMessage[]
        {
            const parsedMessages: IMessage[] = [];

            rawMessages.ListK.forEach(K =>
            {
                parsedMessages.push({
                    id: K._recordId,
                    postDate: new Date(K.DataNadania),
                    sender: K.Nadawca,
                    senderId: K._idNadawcy,
                    title: K.Tytul
                });
            });

            return parsedMessages;
        }
    });
}