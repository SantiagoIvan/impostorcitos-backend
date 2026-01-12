export class Report{
    constructor(
        private report: string,
        private date: string = new Date().toISOString()
    ){}
    getReport(){
        return this.report
    }
}