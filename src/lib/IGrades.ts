export interface IGrades
{
    semestersCount: number;
    evaluationType: number;
    isGpaWeighted: boolean;
    selectedSemester: number;

    subjects: IGrades.ISubject[];
}

export namespace IGrades
{
    export interface IGrade
    {
        issuedDate: number;
        issuedBy: string;
        countsForGpa: boolean;
        history: IGrades.IHistory[];
        category: string;
        color: string;
        grade: string;
        semester: number;
        type: number;
        weight: number;
        valueForGpa: number;
        idK: number;
    }

    export interface IHistory
    {
        issuedDate: number;
        countsForGpa: boolean;
        category: string;
        color: string;
        grade: string;
        semester: number;
        reason: string;
        weight: number;
        valueForGpa: number;
    }

    export interface ISubject
    {
        id: number;
        name: string;
        yearGpa: string;
        semestersGpa: {
            [index: number]: string
        };
    
        semesters: {
            [index: number]: IGrades.IGrade[]
        };
    }
}