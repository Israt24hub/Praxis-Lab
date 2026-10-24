import type { Lesson } from "../../types/content";

/*
 * Object detection and segmentation. The scene and detector output are made up
 * (src/lib/detection-scene.ts); IoU, NMS and AP come from src/lib/detection.ts and are checked
 * against torchvision.ops and pycocotools in tests/vision.test.ts. The code output was produced
 * by running the script with PyTorch and torchvision.
 */
export const detectionSegmentation: Lesson = {
  id: "detection-segmentation",
  pathSlug: "computer-vision",
  topicSlug: "detection-segmentation",
  title: "Object detection and segmentation",
  summary:
    "Classification says what is in an image; detection also says where, with a box around every object; segmentation labels every pixel. Each needs its own way of scoring: intersection over union for overlap, non-maximum suppression for duplicates, and average precision for a whole ranked list of guesses.",
  level: "intermediate",
  minutes: [55, 75],
  objectives: [
    "Distinguish **classification**, **detection**, **semantic** and **instance segmentation** by their outputs",
    "Compute **intersection over union (IoU)** and explain how it decides a hit",
    "Explain **non-maximum suppression** and the trade-off its threshold controls",
    "Read **average precision** and **mAP** results, including COCO’s AP over IoU 0.50–0.95",
  ],
  prerequisites: [
    { label: "Pooling and CNN architectures", href: "/learn/computer-vision/pooling-cnn-architectures" },
    { label: "Metrics and cross-validation", href: "/learn/ml-foundations/metrics-cross-validation" },
  ],

  intro: [
    {
      type: "p",
      text: "**Object detection** finds every object of interest in an image and returns, for each, a **bounding box**, a class and a confidence score. **Semantic segmentation** assigns a class to every pixel; **instance segmentation** also separates the individual objects, giving one mask per object.",
    },
    {
      type: "p",
      text: "Scoring them is harder than counting right answers. A box can be nearly right, an object can be found twice or not at all, and a detector outputs a ranked list of guesses rather than one answer. This lesson builds the standard scores from the ground up on a small made-up picture of apples.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Detection and segmentation results are reported almost entirely in AP and mAP, and those numbers hide choices: the IoU needed to count as a hit, how duplicates are handled, how the precision–recall curve is averaged. In the lab, the same detections score an AP of 0.976 at IoU 0.5 but 0.718 at IoU 0.75 — and 0.654 by COCO’s average over ten thresholds.",
    },
    {
      type: "p",
      text: "Segmentation has a trap of its own: when the object is small, predicting “nothing” is mostly right. In the lab an empty mask gets 87.5% pixel accuracy and an IoU of 0.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**IoU.** Overlap between a predicted box and the true one: the area they share divided by the area they cover together. 1 is a perfect match, 0 no overlap. A detection usually counts as correct when its IoU with a true object is at least 0.5.",
      },
      {
        type: "p",
        text: "**Duplicates and NMS.** Detectors tend to put several boxes on one object. **Non-maximum suppression** keeps the highest-scoring box and deletes others that overlap it too much, then repeats. Set the overlap limit too low and a real neighbouring object is deleted; too high and duplicates survive. Each duplicate that survives counts as a false positive.",
      },
      {
        type: "p",
        text: "**Precision and recall for a ranked list.** Sort the detections from most to least confident and walk down the list: precision is the fraction of detections so far that were hits, recall the fraction of real objects found so far. A good detector keeps precision high while recall climbs to 1.",
      },
      {
        type: "p",
        text: "**AP and mAP.** Average precision summarises that curve in one number; mAP averages AP over the classes. Segmentation is scored per pixel with IoU (or Dice) between masks, ignoring the easy background.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "**Matching.** For one class and image, detections are processed in decreasing score order; each takes the unmatched ground-truth box with the highest IoU, if that IoU reaches the threshold, and becomes a true positive; otherwise it is a false positive. Each ground-truth box can be matched once, so duplicates are false positives. PASCAL VOC defined it this way, with a threshold of 0.5.",
      },
      {
        type: "p",
        text: "**AP.** Make precision non-increasing from the right (the *envelope*: precision at recall r becomes the best precision at any recall ≥ r), sample it at fixed recall levels, and average. VOC’s original definition used 11 levels (0, 0.1, …, 1); COCO’s evaluation code uses 101 (0, 0.01, …, 1) and reports **AP** as the mean over IoU thresholds 0.50, 0.55, …, 0.95, alongside AP50 and AP75, with at most 100 detections per image. pycocotools’ summary also averages over all classes, so COCO’s “AP” is a class average — what other papers call mAP.",
      },
      {
        type: "p",
        text: "**Detectors.** Two-stage detectors such as Faster R-CNN first propose candidate regions with a region proposal network sharing the backbone’s features, then classify and refine each. One-stage detectors such as YOLO predict boxes and class probabilities directly from the whole image in one pass. Both output many overlapping candidates and rely on NMS.",
      },
      {
        type: "p",
        text: "**Segmentation.** Fully convolutional networks (Long et al.) produce a class score for every pixel, combining coarse semantic maps with finer, higher-resolution ones. Mask R-CNN adds a mask branch to Faster R-CNN for instance segmentation. Mask quality is measured with IoU = |P ∩ T| / |P ∪ T| or Dice = 2|P ∩ T| / (|P| + |T|) over pixels, averaged over classes as mean IoU.",
      },
    ],
  },

  analogy: {
    title: "Marking a treasure hunt",
    blocks: [
      {
        type: "p",
        text: "Players mark on a map where they think each treasure is, with how sure they are. A mark counts if it lands mostly on a real treasure (IoU above the threshold); a second mark on a treasure already claimed scores nothing. Read the marks from most to least sure: a good player’s confident marks are nearly all right, and by the end every treasure is found.",
      },
      {
        type: "p",
        text: "Where the analogy fails: in detection the “mostly on” rule is a precise number, and moving it from 0.5 to 0.75 can change who wins.",
      },
    ],
  },

  workedExample: {
    title: "AP for the lab’s detector, by hand",
    blocks: [
      {
        type: "p",
        text: "After NMS at 0.5, ten of the made-up detector’s 13 boxes remain for the six apples. IoU of the first box, (42, 62, 92, 112), with its apple (40, 60, 90, 110): intersection 48 × 48 = 2,304; union 2,500 + 2,500 − 2,304 = 2,696; IoU = **0.855**.",
      },
      {
        type: "table",
        caption: "Kept detections in score order, matched at IoU ≥ 0.5",
        head: ["Rank", "score", "best IoU", "result", "precision", "recall"],
        rows: [
          ["1", "0.96", "0.85", "hit", "1.00", "0.17"],
          ["2", "0.92", "0.85", "hit", "1.00", "0.33"],
          ["3", "0.88", "0.66", "hit", "1.00", "0.50"],
          ["4", "0.85", "0.91", "hit", "1.00", "0.67"],
          ["5", "0.75", "0.78", "hit", "1.00", "0.83"],
          ["6", "0.66", "0.00", "miss (a leaf)", "0.83", "0.83"],
          ["7", "0.62", "0.92", "hit", "0.86", "1.00"],
          ["8", "0.38", "0.00", "miss", "0.75", "1.00"],
          ["9", "0.30", "0.61", "duplicate", "0.67", "1.00"],
          ["10", "0.22", "0.00", "miss", "0.60", "1.00"],
        ],
      },
      {
        type: "p",
        text: "The envelope is 1.00 up to recall 0.83 and 0.857 (rank 7’s 6/7) from there to 1. Of COCO’s 101 recall levels, 84 (0 to 0.83) read 1.00 and 17 (0.84 to 1) read 0.857: AP50 = (84 + 17 × 0.857)/101 = **0.976**.",
      },
      {
        type: "p",
        text: "At IoU ≥ 0.75 the loose box at rank 3 (IoU 0.66) becomes a miss and its apple is never found, so recall stops at 0.83 and AP75 = **0.718**. Averaging AP over the ten thresholds 0.50…0.95 gives COCO’s AP of **0.654**.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "IoU(A, B) = area(A ∩ B) / area(A ∪ B) = |A ∩ B| / (|A| + |B| − |A ∩ B|)", meaning: "Overlap of two boxes (or masks), from 0 to 1." },
      { type: "equation", expression: "precision_k = TP_k / k,   recall_k = TP_k / G", meaning: "After the k most confident detections, with G ground-truth objects." },
      { type: "equation", expression: "p̃(r) = max_(r′ ≥ r) p(r′),   AP = (1/101) Σ_(r ∈ {0, 0.01, …, 1}) p̃(r)", meaning: "COCO-style AP: the precision envelope averaged over 101 recall levels (0 where a level is never reached)." },
      { type: "equation", expression: "AP_COCO = mean over t ∈ {0.50, 0.55, …, 0.95} of AP_t;   mAP = mean over classes of AP", meaning: "COCO averages over IoU thresholds; mAP averages over classes." },
      { type: "equation", expression: "Dice = 2|P ∩ T| / (|P| + |T|) = 2 IoU / (1 + IoU)", meaning: "The mask score related to IoU; always at least as large." },
    ],
    notation: [
      { symbol: "A, B", meaning: "Two boxes (x1, y1, x2, y2)" },
      { symbol: "TP_k", meaning: "True positives among the top k detections" },
      { symbol: "G", meaning: "Number of ground-truth objects" },
      { symbol: "p̃(r)", meaning: "Interpolated precision at recall r" },
      { symbol: "P, T", meaning: "Predicted and true masks (sets of pixels)" },
    ],
  },

  process: {
    title: "Evaluating a detector",
    steps: [
      { title: "Fix the conventions", text: "Box format (x1, y1, x2, y2 or x, y, w, h), IoU threshold(s), maximum detections per image, and which AP definition." },
      { title: "Run NMS as deployed", text: "With the threshold the system will use; report it." },
      { title: "Match per class and image", text: "In score order, greedily, each ground-truth box at most once." },
      { title: "Build precision–recall and AP", text: "Envelope, sample at recall levels, average; then average over classes for mAP." },
      { title: "Report several views", text: "AP over IoU 0.50–0.95 plus AP50 and AP75, and per-class AP to find weak classes." },
      { title: "Use the reference implementation", text: "pycocotools or a library built on it, so numbers are comparable with published ones." },
    ],
  },

  interactive: {
    component: "detection-lab",
    kind: "computation",
    intro:
      "A made-up picture of six apples and a made-up detector’s 13 scored boxes, scored in your browser with the same rules as COCO’s evaluation (checked against torchvision and pycocotools). Four panels: IoU of two boxes, non-maximum suppression, precision–recall and AP, and segmentation masks.",
    tryThis: [
      "Panel 1: read the IoU for the default box, moved 10 pixels right. Then centre it and shrink it to 60%.",
      "Panel 2: lower the NMS threshold to 0.3, then raise it to 0.7 and switch it off. Watch the two touching apples at the bottom.",
      "Panel 3: switch the hit threshold from 0.5 to 0.75 and compare the curve and AP.",
      "Panel 4: try each predicted mask, ending with “Nothing”.",
    ],
    expect: [
      { action: "Box moved 10 px; centred at 60%", result: "IoU 0.667 (a hit at 0.5, a miss at 0.75); 0.360 when centred at 60% of the size." },
      { action: "NMS 0.5 (default)", result: "10 of 13 boxes kept, all 6 apples found, 4 false alarms or duplicates, AP50 0.976." },
      { action: "NMS 0.3", result: "8 boxes kept: one of the touching apples is deleted (their boxes overlap by 0.33), so AP50 falls to 0.832." },
      { action: "NMS 0.7 or off", result: "All 13 boxes kept; two duplicates (scores 0.81 and 0.70) now rank above a real apple, and AP50 falls to 0.916." },
      { action: "Hit at IoU 0.75", result: "Both boxes on one apple are too loose (IoU 0.66 and 0.61), so it is never found: AP 0.718. COCO’s AP over 0.50–0.95 is 0.654." },
      { action: "Masks", result: "1 px to the right: IoU 0.684, Dice 0.813. 1 px too big: 0.615 / 0.762. Nothing: 87.5% pixel accuracy, IoU 0." },
    ],
  },

  code: {
    label: "detection_metrics.py",
    language: "Python",
    source: `import torch
from torchvision.ops import box_iou, nms

# Boxes are (x1, y1, x2, y2) in pixels: the lab's six apples and its made-up detector's output.
truth = torch.tensor([[40, 60, 90, 110], [120, 40, 170, 92], [200, 90, 246, 136],
                      [260, 30, 300, 72], [150, 130, 196, 176], [172, 134, 216, 178]], dtype=torch.float)
boxes = torch.tensor([[42, 62, 92, 112], [36, 56, 88, 106], [118, 42, 168, 90], [126, 48, 176, 98],
                      [204, 94, 252, 142], [262, 34, 298, 74], [70, 20, 110, 56], [255, 24, 296, 68],
                      [151, 131, 197, 177], [173, 135, 217, 179], [10, 150, 50, 190], [205, 88, 240, 128],
                      [222, 20, 252, 50]], dtype=torch.float)
scores = torch.tensor([.96, .81, .92, .70, .88, .75, .66, .55, .62, .85, .38, .30, .22])

print("IoU of the first box with each apple:", [round(v, 3) for v in box_iou(boxes[:1], truth)[0].tolist()])
keep = nms(boxes, scores, iou_threshold=0.5)    # indices, highest score first
print("kept by NMS:", keep.tolist())

def average_precision(boxes, scores, truth, iou_min):
    order = scores.argsort(descending=True)
    ious = box_iou(boxes[order], truth)
    matched, hits = set(), []
    for row in ious:                             # each detection, best score first
        free = [(v.item(), j) for j, v in enumerate(row) if j not in matched and v >= iou_min]
        if free:
            matched.add(max(free)[1])
        hits.append(bool(free))
    hits = torch.tensor(hits, dtype=torch.float)
    tp = hits.cumsum(0)
    precision = tp / torch.arange(1, len(hits) + 1)
    recall = tp / len(truth)
    for i in range(len(precision) - 2, -1, -1):  # the envelope: never rising to the left
        precision[i] = max(precision[i], precision[i + 1])
    levels = torch.linspace(0, 1, 101)           # COCO's 101 recall levels
    return sum(precision[recall >= r][0].item() if (recall >= r).any() else 0.0 for r in levels) / 101

for name, b, s in [("all boxes", boxes, scores), ("after NMS", boxes[keep], scores[keep])]:
    ap50 = average_precision(b, s, truth, 0.5)
    ap75 = average_precision(b, s, truth, 0.75)
    print(f"{name:10s} AP50 {ap50:.3f}  AP75 {ap75:.3f}")

# Masks: IoU and Dice count only object pixels; pixel accuracy is fooled by the background.
yy, xx = torch.meshgrid(torch.arange(16), torch.arange(16), indexing="ij")
true_mask = (xx - 7.5) ** 2 + (yy - 7.5) ** 2 <= 3.5 ** 2
empty = torch.zeros_like(true_mask)
iou = (empty & true_mask).sum().item() / (empty | true_mask).sum().item()
print("empty mask: pixel accuracy", (empty == true_mask).float().mean().item(), "| IoU", iou)`,
    walkthrough: [
      { lines: "5–11", text: "The lab’s scene as tensors: six true boxes, 13 detected boxes and their scores, in torchvision’s (x1, y1, x2, y2) format." },
      { lines: "13–15", text: "box_iou gives a matrix of IoUs (here one row); nms returns the kept indices, highest score first." },
      { lines: "17–25", text: "COCO-style matching: in score order, each detection takes the free true box it overlaps most, if the IoU reaches the threshold." },
      { lines: "26–33", text: "Running precision and recall, the envelope, and the average over 101 recall levels (0 for levels never reached)." },
      { lines: "35–38", text: "AP50 and AP75 before and after NMS." },
      { lines: "41–45", text: "A disc-shaped true mask of 32 pixels on a 16 × 16 grid, and an empty prediction: high pixel accuracy, zero IoU." },
    ],
    shapes: [
      { name: "truth", shape: "(6, 4)", meaning: "Six true boxes, (x1, y1, x2, y2)" },
      { name: "boxes", shape: "(13, 4)", meaning: "The detector’s boxes" },
      { name: "box_iou(boxes, truth)", shape: "(13, 6)", meaning: "IoU of every detection with every true box" },
      { name: "keep", shape: "(10,)", meaning: "Indices kept by NMS at 0.5" },
      { name: "true_mask", shape: "(16, 16) bool", meaning: "One object’s pixels" },
    ],
    output: {
      label: "Output",
      text: "IoU of the first box with each apple: [0.855, 0.0, 0.0, 0.0, 0.0, 0.0]\nkept by NMS: [0, 2, 4, 9, 5, 6, 8, 10, 11, 12]\nall boxes  AP50 0.916  AP75 0.662\nafter NMS  AP50 0.976  AP75 0.718\nempty mask: pixel accuracy 0.875 | IoU 0.0",
      note: "Produced by running the script with PyTorch and torchvision. The numbers match the lab and the worked example: NMS removes three duplicates and raises AP50 from 0.916 to 0.976. For published comparisons use pycocotools, which these values were also checked against.",
    },
  },

  useCases: [
    {
      title: "Driving and robotics",
      text: "Detectors find cars, people and signs with boxes; segmentation marks drivable road and free space pixel by pixel.",
    },
    {
      title: "Medical imaging",
      text: "Segmentation outlines organs and lesions for measurement, usually scored with Dice; detection flags candidate nodules for a clinician to review.",
    },
    {
      title: "Counting and inspection",
      text: "Counting fruit, cells or defects is detection followed by counting the kept boxes, so NMS settings directly change the count.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Mixing box formats",
      text: "(x1, y1, x2, y2) and (x, y, width, height) look alike. Feeding one as the other gives plausible-looking but wrong IoUs; COCO annotations use (x, y, w, h), torchvision.ops uses (x1, y1, x2, y2).",
    },
    {
      kind: "mistake",
      title: "Comparing APs computed differently",
      text: "AP50, AP75, COCO’s AP over 0.50–0.95, 11-point and 101-point AP are different numbers. Check which one a paper reports before comparing.",
    },
    {
      kind: "mistake",
      title: "Pixel accuracy for small objects",
      text: "When the background dominates, predicting nothing scores well. Use IoU or Dice per class.",
    },
    {
      kind: "misconception",
      title: "“A higher NMS threshold is safer”",
      text: "It keeps more duplicates, each a false positive. Lower thresholds remove real objects that overlap. The right value depends on how crowded the scenes are.",
    },
    {
      kind: "limitation",
      title: "AP hides what kind of error",
      text: "A low AP can come from loose boxes, missed small objects, duplicates or confused classes. Look at AP50 versus AP75, per-class and per-size results, and examples.",
    },
  ],

  exercise: {
    prompt: [
      {
        type: "list",
        ordered: true,
        items: [
          "Compute the IoU of boxes (0, 0, 10, 10) and (5, 0, 15, 10).",
          "Three true objects. Detections in score order are: hit, miss, hit, hit, miss. Write precision and recall after each.",
          "Compute that detector’s AP with 11 recall levels (0, 0.1, …, 1), using the precision envelope.",
          "A predicted mask has 40 pixels, the true mask 50, and they share 30. Compute IoU and Dice.",
        ],
      },
    ],
    hints: ["Intersection 5 × 10.", "Precision = hits so far ÷ detections so far; recall = hits so far ÷ 3.", "The envelope at recall r is the best precision at any recall ≥ r.", "IoU = 30 / (40 + 50 − 30)."],
    solution: [
      { type: "p", text: "Intersection 50, union 100 + 100 − 50 = 150: IoU = **1/3 ≈ 0.333**." },
      { type: "p", text: "Precision 1, 0.5, 0.667, 0.75, 0.6; recall 0.333, 0.333, 0.667, 1, 1." },
      { type: "p", text: "Envelope: 1 for recall up to 0.333, then 0.75 up to 1. Levels 0, 0.1, 0.2, 0.3 read 1 (4 levels); 0.4 to 1.0 read 0.75 (7 levels). AP = (4 + 7 × 0.75)/11 = **0.841**." },
      { type: "p", text: "IoU = 30/60 = **0.5**; Dice = 60/90 = **0.667**." },
    ],
  },

  quiz: [
    {
      question: "Which task outputs one mask per individual object?",
      options: ["Classification", "Object detection", "Semantic segmentation", "Instance segmentation"],
      answer: 3,
      explanation: "Semantic segmentation labels pixels by class only; instance segmentation separates the objects.",
    },
    {
      question: "Two boxes of area 100 overlap in an area of 60. What is their IoU?",
      options: ["0.6", "0.43", "0.3", "0.75"],
      answer: 1,
      explanation: "60 / (100 + 100 − 60) = 60/140 ≈ 0.43.",
    },
    {
      question: "What happens to a second detection of an object that is already matched?",
      options: ["It is ignored", "It counts as a false positive", "It counts as a true positive", "It raises the IoU"],
      answer: 1,
      explanation: "Each ground-truth object can be matched once; duplicates are false positives, which is why NMS matters.",
    },
    {
      question: "In the lab, lowering the NMS threshold from 0.5 to 0.3 lowers AP50 from 0.976 to 0.832. Why?",
      options: [
        "More duplicates survive",
        "Two touching apples’ boxes overlap by 0.33, so one real detection is suppressed",
        "The IoU threshold changed",
        "The scores changed",
      ],
      answer: 1,
      explanation: "A strict threshold treats a neighbouring real object as a duplicate and deletes it.",
    },
    {
      question: "What does COCO’s headline AP average over?",
      options: ["Only IoU 0.5", "IoU thresholds 0.50 to 0.95 in steps of 0.05 (and over classes)", "Image sizes", "Training epochs"],
      answer: 1,
      explanation: "It rewards precise localisation: loose boxes score at 0.5 but not at higher thresholds.",
    },
  ],

  glossary: [
    { term: "Bounding box", definition: "An axis-aligned rectangle around an object, e.g. (x1, y1, x2, y2)." },
    { term: "Intersection over union (IoU)", definition: "Area of overlap divided by area of union; for boxes or masks." },
    { term: "Non-maximum suppression (NMS)", definition: "Keeping the best-scoring box and removing others that overlap it above a threshold, repeatedly." },
    { term: "Average precision (AP)", definition: "The average of the precision envelope over recall levels, for one class." },
    { term: "mAP", definition: "AP averaged over classes (and, in COCO, over IoU thresholds)." },
    { term: "Semantic segmentation", definition: "Assigning a class to every pixel." },
    { term: "Instance segmentation", definition: "A separate mask for each object." },
    { term: "Dice coefficient", definition: "2|P ∩ T| / (|P| + |T|), a mask overlap score related to IoU." },
  ],

  references: [
    {
      title: "The PASCAL Visual Object Classes (VOC) Challenge",
      source: "Mark Everingham, Luc Van Gool, Christopher K. I. Williams, John Winn & Andrew Zisserman, International Journal of Computer Vision 88, 2010",
      url: "https://www.microsoft.com/en-us/research/publication/the-pascal-visual-object-classes-voc-challenge/",
      note: "IoU above 0.5 for a correct detection, duplicates as false detections, and interpolated AP.",
    },
    {
      title: "Microsoft COCO: Common Objects in Context",
      source: "Tsung-Yi Lin, Michael Maire, Serge Belongie et al., arXiv:1405.0312",
      url: "https://arxiv.org/abs/1405.0312",
      note: "The dataset behind the COCO detection and segmentation benchmarks.",
    },
    {
      title: "pycocotools (official COCO API)",
      source: "Python Package Index",
      url: "https://pypi.org/project/pycocotools/",
      note: "The reference evaluation code: IoU thresholds 0.50:0.05:0.95, 101 recall levels and up to 100 detections per image. The lab’s AP is checked against it.",
    },
    {
      title: "torchvision.ops.nms",
      source: "torchvision documentation",
      url: "https://docs.pytorch.org/vision/stable/generated/torchvision.ops.nms.html",
      note: "(x1, y1, x2, y2) boxes; discards boxes with IoU above the threshold; returns indices by decreasing score.",
    },
    {
      title: "Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks",
      source: "Shaoqing Ren, Kaiming He, Ross Girshick & Jian Sun, arXiv:1506.01497",
      url: "https://arxiv.org/abs/1506.01497",
      note: "A two-stage detector with a region proposal network sharing the backbone.",
    },
    {
      title: "You Only Look Once: Unified, Real-Time Object Detection",
      source: "Joseph Redmon, Santosh Divvala, Ross Girshick & Ali Farhadi, arXiv:1506.02640",
      url: "https://arxiv.org/abs/1506.02640",
      note: "Detection framed as regression to boxes and class probabilities with a single network.",
    },
    {
      title: "Fully Convolutional Networks for Semantic Segmentation",
      source: "Jonathan Long, Evan Shelhamer & Trevor Darrell, arXiv:1411.4038",
      url: "https://arxiv.org/abs/1411.4038",
      note: "Per-pixel prediction with classification networks adapted to dense output.",
    },
    {
      title: "Mask R-CNN",
      source: "Kaiming He, Georgia Gkioxari, Piotr Dollár & Ross Girshick, arXiv:1703.06870",
      url: "https://arxiv.org/abs/1703.06870v3",
      note: "Instance segmentation: a mask branch added to Faster R-CNN.",
    },
  ],

  next: [
    { pathSlug: "computer-vision", topicSlug: "vision-evaluation-interpretation", reason: "Looking beyond one score: errors, per-class results and explanations." },
    { pathSlug: "ml-foundations", topicSlug: "metrics-cross-validation", reason: "Precision, recall and their curves for classifiers." },
    { pathSlug: "computer-vision", topicSlug: "pooling-cnn-architectures", reason: "The backbones that detection and segmentation heads sit on." },
  ],

  teaching: {
    notes: [
      "Compute one IoU on the board before opening the lab; students then predict the lab’s values as they move the box.",
      "Build the worked example’s ranked table together, one row at a time — it is the whole of AP.",
      "Stress that “AP” in different papers can mean different things; ask students to find which definition a paper uses.",
    ],
    demo: "Run a pretrained torchvision detector on a crowded photo with NMS thresholds of 0.3, 0.5 and 0.8 and show the boxes; then evaluate on a handful of annotated images with pycocotools.",
    discussion: [
      "Why might a self-driving system prefer a detector with high AP75 over one with high AP50?",
      "In a crowded scene (a stadium), what NMS threshold would you choose, and what would you lose?",
      "When is Dice more informative than pixel accuracy, and when are they similar?",
    ],
    misconceptions: [
      "Thinking AP is the accuracy of the detections.",
      "Believing NMS can remove false alarms that do not overlap anything.",
      "Comparing AP50 from one paper with COCO AP from another.",
    ],
    challenge: {
      prompt:
        "In the lab, the false alarm on a leaf has score 0.66. Explain, without recomputing everything, whether AP50 would rise or fall if its score were 0.20 instead, and why.",
      answer: [
        { type: "p", text: "It would rise. Ranked last instead of sixth, the false alarm comes after every real apple has been found, so precision stays 1.00 all the way to recall 1." },
        { type: "p", text: "The envelope would then be 1.00 at every recall level up to 1, and AP50 would be 1.0. AP depends only on how detections are ordered, so a confident false alarm costs more than a hesitant one." },
      ],
    },
  },
};
