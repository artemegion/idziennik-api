export interface IMessage
{
    postDate: Date;
    readDate: Date;
    sender: string;
    title: string;
    text: string;

    id: number;
}