/**
 * YOLOv8 Post-processing Utilities
 */

export interface DetectedObject {
    label: string;
    confidence: number;
    box: [number, number, number, number]; // [x1, y1, x2, y2]
}

export const YOLO_CLASSES = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
    'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
    'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
    'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
    'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
    'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
    'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
    'hair drier', 'toothbrush'
];

/**
 * Calculate Intersection over Union (IoU) between two bounding boxes
 */
export function iou(box1: number[], box2: number[]): number {
    const [x1, y1, w1, h1] = [box1[0], box1[1], box1[2] - box1[0], box1[3] - box1[1]];
    const [x2, y2, w2, h2] = [box2[0], box2[1], box2[2] - box2[0], box2[3] - box2[1]];

    const xi1 = Math.max(x1, x2);
    const yi1 = Math.max(y1, y2);
    const xi2 = Math.min(x1 + w1, x2 + w2);
    const yi2 = Math.min(y1 + h1, y2 + h2);

    const interArea = Math.max(0, xi2 - xi1) * Math.max(0, yi2 - yi1);
    const box1Area = w1 * h1;
    const box2Area = w2 * h2;

    const unionArea = box1Area + box2Area - interArea;
    return interArea / unionArea;
}

/**
 * Non-Maximum Suppression functions (simplest implementation)
 */
export function nonMaxSuppression(
    boxes: number[][],
    scores: number[],
    classes: number[],
    iouThreshold: number
): number[] {
    const indices = Array.from(Array(scores.length).keys())
        .sort((a, b) => scores[b] - scores[a]);

    const results: number[] = [];

    while (indices.length > 0) {
        const current = indices.shift()!;
        results.push(current);

        for (let i = indices.length - 1; i >= 0; i--) {
            const idx = indices[i];
            if (classes[current] === classes[idx] && iou(boxes[current], boxes[idx]) > iouThreshold) {
                indices.splice(i, 1);
            }
        }
    }

    return results;
}
