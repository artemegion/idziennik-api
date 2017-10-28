import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { IMessageDetails } from '../IMessageDetails';

export function fetchMessage(session: ISession, messageId: string): Promise<IMessageDetails>
{
    return new Promise<IMessageDetails>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_komunikator/WS_wiadomosci.asmx/PobierzWiadomosc')
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .type('application/json')
            .encoding('UTF-8')
            .redirect(false)
            .jar(false)
            .send(`{"idWiadomosci":"${messageId}","typWiadomosci":0}`)
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
                        const parsedMessage = parseMessage(response.body.d);

                        resolve(parsedMessage);
                    }
                    else
                    {
                        reject(new Error(`Could not fetch message (response status ${response.status})`));
                    }
                }
            });

        function parseMessage(rawMessage: any): IMessageDetails
        {
            const parsedMessage: IMessageDetails = {
                id: rawMessage.Wiadomosc._recordId,
                postDate: rawMessage.Wiadomosc.DataNadania,
                readDate: rawMessage.Wiadomosc.DataOdczytania,
                sender: rawMessage.Wiadomosc.Nadawca,
                text: rawMessage.Wiadomosc.Text,
                title: rawMessage.Wiadomosc.Tytul,
                status: rawMessage.ListaOdbiorcow[0].Status,
                attachments: []
            };

            rawMessage.Wiadomosc.ListaZal.forEach(Zal =>
            {
                parsedMessage.attachments.push({
                    id: Zal.Id,
                    name: Zal.Nazwa
                });
            });

            return parsedMessage;
        }
    });
}