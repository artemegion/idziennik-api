export interface IStudentInfo
{
    name: string;

    classId: string;
    registerId: number;
    years: IYear[];
}

export interface IYear
{
    id: number;
    name: string;
}