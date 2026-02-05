import { YoloService } from "./YoloService";

export class YoloServiceFactory {
    private static instance: YoloService;

    static getInstance(): YoloService {
        if (!this.instance) {
            this.instance = new YoloService();
        }
        return this.instance;
    }
}
