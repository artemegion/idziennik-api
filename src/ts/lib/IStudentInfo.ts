export interface IStudentInfo
{
    name: string;
    classId: string;
    
    years: IStudentInfo.IYear[];
}

export namespace IStudentInfo
{
    export interface IYear
    {
        id: number;
        name: string;
        
        registerId: number;
    }
}