<?php
 
class Analyzer {
    private $pdo;
 
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
 
    public function analyze($text, $url = '') {
        // --- 1. Basic Sanity Check ---
        $words = preg_split('/\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY);
        $wordCount = count($words);
        $maxWordLen = 0;
        foreach($words as $w) {
            $maxWordLen = max($maxWordLen, mb_strlen($w));
        }
 
        if ($wordCount < 4 || $maxWordLen > 30) {
            return $this->returnInvalidResponse();
        }
 
        // --- 2. Advanced Analysis Initialization ---
        $confidenceScore = 65; // Natural high-quality baseline for standard text
        $reasons = [];
 
        // --- 3. Text Richness & Length ---
        if ($wordCount < 12) {
            $confidenceScore -= 15;
            $reasons[] = "تنبيه: نص الخبر قصير جداً؛ الشائعات والأخبار المضللة غالباً ما تكون مقتضبة للغاية وتفتقر للتفاصيل.";
        } elseif ($wordCount > 35) {
            $confidenceScore += 10;
            $reasons[] = "الخبر يحتوي على تفاصيل كافية وتغطية أطول، مما يعزز موثوقية الطرح.";
        }
 
        // --- 4. Attribution & Reporting Phrases (Journalistic Credibility) ---
        $attributions = [
            "صرح", "أوضح", "قال المتحدث", "أكدت الدراسة", "ذكرت مصادر", "وفقاً لـ", 
            "بحسب التقارير", "أفادت الأنباء", "أعلنت وزارة", "نقلت وكالة", "بيان رسمي", 
            "أوضح المسؤول", "أكد المتحدث باسم"
        ];
        $matchedAttributions = [];
        foreach ($attributions as $attr) {
            if (mb_stripos($text, $attr) !== false) {
                $matchedAttributions[] = $attr;
            }
        }
        if (!empty($matchedAttributions)) {
            $confidenceScore += 12;
            $reasons[] = "تم رصد إشارة لمصادر نقل أو جهات رسمية (مثل: " . implode(', ', array_slice($matchedAttributions, 0, 3)) . ") مما يدعم الطابع الصحفي المهني.";
        } else {
            $reasons[] = "تنبيه: النص يفتقر لصيغ العزو الصحفي أو الإشارة لمصادر رسمية.";
        }
 
        // --- 5. Factual Data & Numbers ---
        // Check for Arabic/English numbers or percent signs
        if (preg_match('/[0-9٠-٩٪%]/u', $text)) {
            $confidenceScore += 8;
            $reasons[] = "يشتمل النص على أرقام، تواريخ، أو نسب مئوية تدعم دقة المعلومات.";
        }
 
        // --- 6. Opinionated & Personal Pronouns ---
        $opinions = ["أنا ", "أعتقد ", "في رأيي ", "أرى ", "وجهة نظري ", "أقسم ", "والله العظيم "];
        $matchedOpinions = [];
        foreach ($opinions as $op) {
            if (mb_stripos($text, $op) !== false) {
                $matchedOpinions[] = trim($op);
            }
        }
        if (!empty($matchedOpinions)) {
            $confidenceScore -= 10;
            $reasons[] = "تم رصد لغة رأي شخصي أو تعبيرات ذاتية (مثل: " . implode(', ', $matchedOpinions) . ")، مما يقلل من حيادية الخبر.";
        }
 
        // --- 7. Suspicious Keywords (Database & Hardcoded Urgency) ---
        $matchedKeywords = $this->analyzeKeywords($text, $confidenceScore);
        if (!empty($matchedKeywords)) {
            $reasons[] = "تم رصد كلمات تضليل أو إثارة في النص: " . implode(', ', $matchedKeywords);
        }
 
        $urgencyMatched = $this->analyzeUrgencyPhrases($text, $confidenceScore);
        if (!empty($urgencyMatched)) {
            $reasons[] = "استخدام أسلوب نداءات عاجلة وعبارات إثارة (مثل: " . implode(', ', $urgencyMatched) . ").";
        }
 
        // --- 8. Abnormal Punctuation Pattern ---
        if ($this->checkAbnormalPunctuation($text, $confidenceScore)) {
            $reasons[] = "تكرار مفرط لعلامات التعجب أو الاستفهام (!!! / ؟؟؟) الذي يشير إلى لغة الإثارة الرخيصة.";
        } else {
            // Check for proper basic punctuation commas/periods to add a slight boost
            if (mb_strpos($text, '،') !== false || mb_strpos($text, '.') !== false) {
                $confidenceScore += 5;
            }
        }
 
        // --- 9. Source & URL Analysis ---
        $sourceInfo = $this->analyzeSource($url, $confidenceScore);
        if ($sourceInfo['is_trusted']) {
            $reasons[] = "المصدر موثوق ومسجل رسمياً لدينا: " . $sourceInfo['name'];
        }
        if ($sourceInfo['is_shortened']) {
            $reasons[] = "تحذير: الرابط المستخدم هو رابط مختصر، غالباً ما يستخدم لإخفاء النطاقات المشبوهة.";
        }
 
        // --- 10. Final Score Bounds and Determine Status ---
        $confidenceScore = max(0, min(100, $confidenceScore));
        $statusInfo = $this->determineStatus($confidenceScore, $reasons);
 
        // Log result
        $this->logAnalysis($text, $url, $statusInfo['status'], $confidenceScore);
 
        return [
            'confidence' => $confidenceScore,
            'status' => $statusInfo['status'],
            'status_ar' => $statusInfo['status_ar'],
            'matched_keywords' => array_merge($matchedKeywords, $urgencyMatched),
            'is_trusted_source' => $sourceInfo['is_trusted'],
            'source_name' => $sourceInfo['name'],
            'reasons' => $statusInfo['reasons']
        ];
    }
 
    private function analyzeKeywords($text, &$score) {
        $keywords = $this->getSuspiciousKeywords();
        $matched = [];
        foreach ($keywords as $k) {
            if (mb_stripos($text, $k['keyword']) !== false) {
                $matched[] = $k['keyword'];
                $score -= $k['weight'];
            }
        }
        return $matched;
    }
 
    private function analyzeUrgencyPhrases($text, &$score) {
        $urgencyPhrases = ["انشرها فوراً", "لا تدعها تقف عندك", "خطير جداً", "الحقيقة المغيبة", "سر خطير"];
        $matched = [];
        foreach ($urgencyPhrases as $phrase) {
            if (mb_stripos($text, $phrase) !== false) {
                $matched[] = $phrase;
                $score -= 10;
            }
        }
        return $matched;
    }
 
    private function checkAbnormalPunctuation($text, &$score) {
        if (preg_match('/[!؟]{3,}/u', $text)) {
            $score -= 15;
            return true;
        }
        return false;
    }
 
    private function analyzeSource($url, &$score) {
        $res = ['is_trusted' => false, 'name' => '', 'is_shortened' => false];
        if (empty($url)) return $res;
 
        $parsedUrl = parse_url($url);
        $domain = isset($parsedUrl['host']) ? strtolower($parsedUrl['host']) : '';
        if (strpos($domain, 'www.') === 0) $domain = substr($domain, 4);
 
        // Check Shortened URLs
        $shorteners = ['bit.ly', 'goo.gl', 't.co', 'tinyurl.com'];
        if (in_array($domain, $shorteners)) {
            $res['is_shortened'] = true;
            $score -= 15;
        }
 
        // Check Trusted
        $trusted = $this->getTrustedSources();
        foreach ($trusted as $src) {
            if ($domain === strtolower($src['domain'])) {
                $res['is_trusted'] = true;
                $res['name'] = $src['source_name'];
                $score += 25;
                break;
            }
        }
        return $res;
    }
 
    private function determineStatus($score, $currentReasons) {
        if ($score >= 75) {
            return [
                'status' => 'trusted',
                'status_ar' => "خبر موثوق",
                'reasons' => array_merge($currentReasons, ["الخبر يمتلك خصائص المصداقية والاحترافية العالية."])
            ];
        } elseif ($score >= 45) {
            return [
                'status' => 'uncertain',
                'status_ar' => "غير مؤكد",
                'reasons' => array_merge($currentReasons, ["لا توجد أدلة كافية للجزم بصحته أو كذبه."])
            ];
        } else {
            return [
                'status' => 'fake',
                'status_ar' => "احتمال عالي أنه خبر كاذب",
                'reasons' => array_merge($currentReasons, ["تم العثور على مؤشرات تضليل قوية في النص أو المصدر."])
            ];
        }
    }
 
    private function returnInvalidResponse() {
        return [
            'confidence' => 0, 'status' => 'invalid', 'status_ar' => "نص غير صالح",
            'matched_keywords' => [], 'is_trusted_source' => false, 'source_name' => '',
            'reasons' => ["النص المدخل عشوائي أو قصير جداً للتحليل."]
        ];
    }
 
    private function getSuspiciousKeywords() {
        $stmt = $this->pdo->query("SELECT * FROM suspicious_keywords");
        return $stmt->fetchAll();
    }
 
    private function getTrustedSources() {
        $stmt = $this->pdo->query("SELECT * FROM trusted_sources");
        return $stmt->fetchAll();
    }
 
    private function logAnalysis($text, $url, $status, $score) {
        $stmt = $this->pdo->prepare("INSERT INTO analysis_logs (input_text, source_url, result_status, confidence_score) VALUES (?, ?, ?, ?)");
        $stmt->execute([$text, $url, $status, $score]);
    }
}
