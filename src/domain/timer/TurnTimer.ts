export class TurnTimer{
    constructor(
        public timeout: NodeJS.Timeout,
        public endsAt: number // timestamp en ms 
    ){}
}