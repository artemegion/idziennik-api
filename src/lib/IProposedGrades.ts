export interface IProposedGrades
{
    semestersCount: number;

    subjects: {
        name: string,
        
        semesters: {
            [index: number]: string
        }
    }[];
}