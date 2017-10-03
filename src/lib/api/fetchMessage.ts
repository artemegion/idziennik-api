import * as unirest from 'unirest';

import { ISession } from '../ISession';
import { IMessage } from '../IMessage';

export interface IFetchMessageRequest
{
    session: ISession;
    messageId: string;
}

export interface IFetchMessageResponse
{
    message: IMessage;
}

export function fetchMessage(request: IFetchMessageRequest): Promise<IFetchMessageResponse>
{
    return new Promise<IFetchMessageResponse>((resolve, reject) =>
    {
        unirest.post('https://iuczniowie.progman.pl/idziennik/mod_komunikator/WS_wiadomosci.asmx/PobierzWiadomosc')
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537 (KHTML, like Gecko) Chrome/60 Safari/537',
                'X-Requested-With': 'XMLHttpRequest'
            })
            .redirect(false)
            .jar(false)
            .encoding('UTF-8')
            .send(`{"idWiadomosci":"${request.messageId}","typWiadomosci":0}`)
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
                        const parsedMessage = parseMessage(response.body.d);

                        resolve({
                            message: parsedMessage
                        });
                    }
                    else
                    {
                        reject('err_request_not_ok');
                    }
                }
            });

        function parseMessage(rawMessage: any): IMessage
        {
            const parsedMessage: IMessage = {
                postDate: new Date(rawMessage.Wiadomosc.DataNadania),
                readDate: new Date(rawMessage.Wiadomosc.DataOdczytania),
                sender: rawMessage.Wiadomosc.Nadawca,
                title: rawMessage.Wiadomosc.Tytul,
                text: rawMessage.Wiadomosc.Text,
                id: rawMessage.Wiadomosc._recordId
            };

            return parsedMessage;
        }
    });
}