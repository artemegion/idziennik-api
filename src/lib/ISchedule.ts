export interface ISchedule
{
    lessonsTimeFrames: {
        id: number,
        from: string,
        to: string
    }[],

    days: {
        [index: number]: {
            lessonId: number,
            id: number,
            color: string,
            teacher: string,
            name: string,
            description: string,
            replacementType: number,
            classesCancelled: number
        }[]
    }
}