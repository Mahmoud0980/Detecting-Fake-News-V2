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
            "صرح", "أوضح", "قال المتحدث", "أكدت الدراسة", "ذكرت مصادر", "وفقاً لـ", "وفقا لـ",
            "بحسب التقارير", "أفادت الأنباء", "أعلنت وزارة", "نقلت وكالة", "بيان رسمي", 
            "أوضح المسؤول", "أكد المتحدث باسم"
        ];
        $matchedAttributions = [];
        $hasNegation = preg_match('/\b(لم|لا|لن|ليس|نفى|نفت|ينفي)\b/u', $text);

        foreach ($attributions as $attr) {
            $pattern = '/(?<=^|\s)' . preg_quote($attr, '/') . '(?=\s|$|[.,!?،؟])/u';
            if (preg_match($pattern, $text)) {
                $matchedAttributions[] = $attr;
            }
        }
        
        if (!empty($matchedAttributions)) {
            if ($hasNegation) {
                $confidenceScore -= 5;
                $reasons[] = "تنبيه: تم رصد صيغ نفي مع جهات رسمية، قد يكون الخبر نفياً لشائعة وليس إثباتاً لها.";
            } else {
                $confidenceScore += 12;
                $reasons[] = "تم رصد إشارة لمصادر نقل أو جهات رسمية (مثل: " . implode(', ', array_slice($matchedAttributions, 0, 3)) . ") مما يدعم الطابع الصحفي المهني.";
            }
        } else {
            $reasons[] = "تنبيه: النص يفتقر لصيغ العزو الصحفي أو الإشارة لمصادر رسمية.";
        }
 
        // --- 5. Factual Data & Numbers ---
        if (preg_match('/[0-9٠-٩٪%]/u', $text)) {
            $confidenceScore += 8;
            $reasons[] = "يشتمل النص على أرقام، تواريخ، أو نسب مئوية تدعم دقة المعلومات.";
        }
 
        // --- 6. Opinionated & Personal Pronouns ---
        $opinions = ["أنا", "أعتقد", "في رأيي", "أرى", "وجهة نظري", "أقسم", "والله العظيم"];
        $matchedOpinions = [];
        foreach ($opinions as $op) {
            $pattern = '/(?<=^|\s)' . preg_quote($op, '/') . '(?=\s|$|[.,!?،؟])/u';
            if (preg_match($pattern, $text)) {
                $matchedOpinions[] = trim($op);
            }
        }
        if (!empty($matchedOpinions)) {
            $confidenceScore -= 10;
            $reasons[] = "تم رصد لغة رأي شخصي أو تعبيرات ذاتية (مثل: " . implode(', ', $matchedOpinions) . ")، مما يقلل من حيادية الخبر.";
        }
        
        // --- 6.5. Sentiment / Clickbait Words ---
        $clickbaitWords = ["كارثة", "رعب", "صدمة", "فضيحة", "خطير", "تدمير", "مؤامرة", "لن تصدق", "عاجل جدا"];
        $matchedClickbait = [];
        foreach ($clickbaitWords as $cb) {
            $pattern = '/(?<=^|\s)' . preg_quote($cb, '/') . '(?=\s|$|[.,!?،؟])/u';
            if (preg_match($pattern, $text)) {
                $matchedClickbait[] = $cb;
            }
        }
        if (count($matchedClickbait) >= 2) {
            $confidenceScore -= 12;
            $reasons[] = "استخدام مفرط للغة العاطفية والإثارة (Clickbait) مثل: " . implode(', ', $matchedClickbait) . ".";
        }

        // --- 6.8. Unverified Major Claims & Hashtags ---
        if (empty($url) && empty($matchedAttributions)) {
            $majorClaims = ["وفاة", "مقتل", "اغتيال", "انفجار", "حريق", "استقالة", "عزل"];
            $hasMajorClaim = false;
            foreach ($majorClaims as $claim) {
                if (mb_stripos($text, $claim) !== false) {
                    $hasMajorClaim = true;
                    break;
                }
            }
            if ($hasMajorClaim) {
                $confidenceScore -= 20;
                $reasons[] = "تحذير: النص يحتوي على ادعاءات خطيرة (مثل الوفاة أو أحداث كبرى) ولكنه يفتقر تماماً لأي رابط مصدر أو جهة مصرحة.";
            } else {
                $confidenceScore -= 5;
                $reasons[] = "تنبيه: النص مجهول المصدر تماماً (لا يوجد رابط أو تصريح رسمي).";
            }
        }

        if (preg_match('/(#عاجل|عاجل:|#هام|هام جدا:)/u', $text)) {
            $confidenceScore -= 15;
            $reasons[] = "رصد صياغة إخبارية غير احترافية (استخدام #عاجل أو عاجل:) الشائعة في شائعات منصات التواصل.";
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
        if ($sourceInfo['tld_warning']) {
            $reasons[] = "تحذير: المصدر يستخدم نطاقاً غير معتاد (مثل .xyz أو .tk)، مما يثير الشكوك حول مصداقيته.";
        }
        if ($sourceInfo['tld_reward']) {
            $reasons[] = "المصدر يستخدم نطاقاً موثوقاً (حكومي أو تعليمي)، مما يرفع المصداقية بشكل كبير.";
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
            'matched_keywords' => array_merge($matchedKeywords, $urgencyMatched, $matchedClickbait),
            'is_trusted_source' => $sourceInfo['is_trusted'],
            'source_name' => $sourceInfo['name'],
            'reasons' => $statusInfo['reasons']
        ];
    }
 
    private function analyzeKeywords($text, &$score) {
        $keywords = $this->getSuspiciousKeywords();
        $matched = [];
        foreach ($keywords as $k) {
            $pattern = '/(?<=^|\s)' . preg_quote($k['keyword'], '/') . '(?=\s|$|[.,!?،؟])/u';
            if (preg_match($pattern, $text)) {
                $matched[] = $k['keyword'];
                $score -= $k['weight'];
            }
        }
        return $matched;
    }
 
    private function analyzeUrgencyPhrases($text, &$score) {
        $urgencyPhrases = [
            "انشرها فورا", "لا تدعها تقف عندك", "خطير جدا", "الحقيقة المغيبة", "سر خطير",
            "أمانة في رقبتك", "مررها لغيرك", "انشر وتؤجر", "تحذير هام", "عاجل وخطير", "احذروا"
        ];
        $matched = [];
        foreach ($urgencyPhrases as $phrase) {
            // Using basic matching here is fine as these are multi-word phrases
            if (mb_stripos($text, $phrase) !== false) {
                $matched[] = $phrase;
                $score -= 15; // Increased penalty for these rumors
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
        $res = ['is_trusted' => false, 'name' => '', 'is_shortened' => false, 'tld_warning' => false, 'tld_reward' => false];
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

        // Check TLDs
        $badTlds = ['.xyz', '.tk', '.info', '.top', '.club', '.online'];
        $goodTlds = ['.gov', '.edu'];
        
        foreach ($badTlds as $tld) {
            if (substr_compare($domain, $tld, -strlen($tld)) === 0) {
                $score -= 15;
                $res['tld_warning'] = true;
                break;
            }
        }
        foreach ($goodTlds as $tld) {
            if (substr_compare($domain, $tld, -strlen($tld)) === 0) {
                $score += 15;
                $res['tld_reward'] = true;
                break;
            }
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
