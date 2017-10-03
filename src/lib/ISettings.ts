export interface ISettings
{
    id: number,
    email: IEmailSettings;
}

export interface IEmailSettings
{
    announcements: string;
    grades: string;
    tests: string;
    notices: string;
}