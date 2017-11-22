export interface ISettings
{
    id: number,
    email: ISettings.IEmail;
}

export namespace ISettings
{
    export interface IEmail
    {
        announcements: string;
        grades: string;
        tests: string;
        notices: string;
    }
}