import * as ort from 'onnxruntime-web';
import { YOLO_CLASSES, nonMaxSuppression, DetectedObject } from '../../core/utils/yoloUtils';

/**
 * Service to handle YOLOv8 inference in the browser via ONNX Runtime Web.
 */
export class YoloService {
    private session: ort.InferenceSession | null = null;
    // Updated fallback URL to a valid source
    private modelPath: string = 'https://raw.githubusercontent.com/yoobright/yolo-onnx/master/yolov8n.onnx';
    private modelInputShape = [1, 3, 640, 640];
    private topk = 100;
    private iouThreshold = 0.45;
    private scoreThreshold = 0.25;

    constructor(customModelPath?: string) {
        if (customModelPath) {
            this.modelPath = customModelPath;
        }
    }

    async loadModel(): Promise<void> {
        try {
            // Configure compiled wasm paths to load from CDN
            // This avoids Vite blocking imports of .mjs/.wasm files from public directory
            ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';

            this.session = await ort.InferenceSession.create(this.modelPath, {
                executionProviders: ['wasm'],
            });
            console.log('YOLO Model loaded successfully');
        } catch (e) {
            console.error('Failed to load YOLO model', e);
            throw new Error('Failed to load YOLO model');
        }
    }

    /**
     * Run inference on an image element.
     * Image should be loaded and mapped to an HTMLImageElement.
     */
    async detect(image: HTMLImageElement): Promise<DetectedObject[]> {
        if (!this.session) {
            await this.loadModel();
        }

        const [input, xRatio, yRatio] = this.preprocess(image);

        const tensor = new ort.Tensor('float32', input, this.modelInputShape);
        const config = new ort.Tensor('float32', new Float32Array([
            this.topk,
            this.iouThreshold,
            this.scoreThreshold
        ])); // NMS Config if needed by model, but standard YOLO export needs custom NMS logic typically

        // Standard YOLOv8 output is [1, 84, 8400] (84 = 4 box coords + 80 classes)
        const { output0 } = await this.session!.run({ images: tensor });

        return this.postprocess(output0, xRatio, yRatio);
    }

    /**
     * Check if model is loaded
     */
    isLoaded(): boolean {
        return !!this.session;
    }

    private preprocess(image: HTMLImageElement): [Float32Array, number, number] {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 640;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('Canvas context unavailable');

        ctx.drawImage(image, 0, 0, 640, 640);
        const imageData = ctx.getImageData(0, 0, 640, 640);
        const { data } = imageData;

        const input = new Float32Array(1 * 3 * 640 * 640);

        for (let i = 0; i < 640 * 640; i++) {
            const r = data[i * 4] / 255.0;
            const g = data[i * 4 + 1] / 255.0;
            const b = data[i * 4 + 2] / 255.0;

            // CHW format
            input[i] = r;
            input[i + 640 * 640] = g;
            input[i + 2 * 640 * 640] = b;
        }

        const xRatio = image.width / 640;
        const yRatio = image.height / 640;

        return [input, xRatio, yRatio];
    }

    private postprocess(output: ort.Tensor, xRatio: number, yRatio: number): DetectedObject[] {
        // Output shape [1, 84, 8400]
        // 84 rows: [x, y, w, h, class0_score, class1_score, ...]
        const modelOutput = output.data as Float32Array;

        const boxes: number[][] = [];
        const scores: number[] = [];
        const classes: number[] = [];

        const numAnchors = 8400; // 640x640 input
        const numClass = 80;

        for (let i = 0; i < numAnchors; i++) {
            // Find maximum score among classes
            let maxScore = -Infinity;
            let maxClass = -1;

            // Loop through classes (start at index 4)
            for (let c = 0; c < numClass; c++) {
                const score = modelOutput[(4 + c) * numAnchors + i]; // Reading strictly using stride if output is [1, 84, 8400] flattened?
                // Wait, output layout depends on export. Standard YOLOv8 export is [1, 84, 8400].
                // That means 84 channels, 8400 anchors.
                // So data is [channel0_anchor0, channel0_anchor1... channel1_anchor0...]

                // Actually it is usually channel-first in memory for ONNX?
                // Let's assume standard output where we access [c, i]

                // To be robust:
                // The logic below assumes [1, 84, 8400].
                // channel 0..3 are box
                // channel 4..83 are classes

                // Accessing [channel, anchor_index]
                // stride = 8400

                if (score > maxScore) {
                    maxScore = score;
                    maxClass = c;
                }
            }

            if (maxScore > this.scoreThreshold) {
                const x = modelOutput[0 * numAnchors + i];
                const y = modelOutput[1 * numAnchors + i];
                const w = modelOutput[2 * numAnchors + i];
                const h = modelOutput[3 * numAnchors + i];

                // Convert cx,cy,w,h to x1,y1,x2,y2
                const x1 = (x - 0.5 * w) * xRatio;
                const y1 = (y - 0.5 * h) * yRatio;
                const x2 = (x + 0.5 * w) * xRatio;
                const y2 = (y + 0.5 * h) * yRatio;

                boxes.push([x1, y1, x2, y2]);
                scores.push(maxScore);
                classes.push(maxClass);
            }
        }

        const nmsIndices = nonMaxSuppression(boxes, scores, classes, this.iouThreshold);

        return nmsIndices.map(idx => ({
            label: YOLO_CLASSES[classes[idx]],
            confidence: scores[idx],
            box: boxes[idx] as [number, number, number, number]
        }));
    }
}
