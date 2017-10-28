export interface ISchedule
{
    lessonsTimeFrames: ISchedule.ITimeFrame[],

    days: {
        [index: number]: ISchedule.IClasses[]
    }
}

export namespace ISchedule
{
    export interface ITimeFrame
    {
        index: number;
        from: string;
        to: string;
    }

    export interface IClasses
    {
        index: number;
        id: number;
        color: string;
        teacher: string;
        name: string;
        description: string;
        replacementType: number;
        classesCancelled: number;
    }
}