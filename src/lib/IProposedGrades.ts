export interface IProposedGrades
{
    semestersCount: number;
    subjects: IProposedGrades.ISubject[];
}

export namespace IProposedGrades
{
    export interface ISubject
    {
        name: string;
        semesters: {
            [index: number]: string;
        }
    }
}