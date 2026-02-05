import { IPDFService, ReportData } from '../../domain/interfaces/IPDFService';

export class GenerateReportUseCase {
    constructor(private pdfService: IPDFService) { }

    async execute(data: ReportData): Promise<void> {
        return this.pdfService.generateReport(data);
    }
}
