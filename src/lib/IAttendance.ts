export interface IAttendance
{
    statistics: IAttendance.IStatistics;
    classes: IAttendance.IClasses[];
}

export namespace IAttendance
{
    export interface IStatistics
    {
        cancelled: number;
        holidays: number;
        absence: number;
        presence: number;
        late: number;
        excuse: number;
        trip: number;
        exempt: number;
        exemptPresent: number;
    }

    export interface IClasses
    {
        classesDate: Date;
        classesTimeSpan: string;
        classesIndex: number;
        classesTopic: string;
    
        type: number;
        wasEdited: boolean;
    
        teacher: string;
        subject: string;
    }
}