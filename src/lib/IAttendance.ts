/*
    TypObecnosci
    0 - ferie
    1 - usprawiedliwienie
    2 - spóźnienie
    3 - nieusprawiedliwione
    4 - zwolnienie
    5 - zajęcia nie odbyły się
    6 - ?
    7 - obecny
    8 - wycieczka
    9 - zwolniony/obecny 
*/
export interface IAttendance
{
    statistics: IAttendanceStatistics;
    entries: IAttendanceEntry[];
}

export interface IAttendanceStatistics
{
    cancelled: number;
    holiday: number;
    absence: number;
    presence: number;
    late: number;
    excuse: number;
    trip: number;
    exempt: number;
    exemptPresent: number;
}

export interface IAttendanceEntry
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