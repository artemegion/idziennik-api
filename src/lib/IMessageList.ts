export interface IMessageList
{
    data: {
        postDate: Date;
        sender: string;
        title: string;

        senderId: string;
        id: string;
    }[];
}