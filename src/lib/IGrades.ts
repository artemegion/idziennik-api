export interface IGrades
{
    semesterCount: number;
    evaluationType: number;
    isGpaWeighted: boolean;
    selectedSemester: number;

    subjects: {
        id: number,
        name: string,
        yearGpa: string,
        semestersGpa: {
            [index: number]: string
        },

        semesters: {
            [index: number]: {
                issuedDate: number,
                issuedBy: string,
                countsForGpa: boolean,
                history: {
                    issuedDate: number,
                    countsForGpa: boolean,
                    category: string,
                    color: string,
                    grade: string,
                    semester: number,
                    reason: string,
                    weight: number,
                    valueForGpa: number
                }[],
                category: string,
                color: string,
                grade: string,
                semester: number,
                type: number,
                weight: number,
                valueForGpa: number,
                idK: number
            }[]
        }
    }[];
}