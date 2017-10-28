export interface IMessageDetails
{
    postDate: Date;
    readDate: Date;
    sender: string;
    title: string;
    text: string;

    id: number;
    status: string;

    attachments: IMessageDetails.IAttachment[];
}

export namespace IMessageDetails
{
    export interface IAttachment
    {
        name: string;
        id: number;
    }
}