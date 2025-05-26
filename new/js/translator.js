// Direct translation helper
document.addEventListener('DOMContentLoaded', function() {
    // Wait until everything is loaded
    window.addEventListener('load', function() {
        // Get the language switch button
        const langSwitchBtn = document.getElementById('lang-switch');
        
        // Add a click event listener to force translation
        if (langSwitchBtn) {
            langSwitchBtn.addEventListener('click', function() {
                // Wait a bit for other scripts to complete
                setTimeout(forceTranslateAllContent, 500);
            });
        }
        
        // SAFETY CHECK: If the page loads and we're already in Arabic mode (rtl class is present)
        // then make sure the translations are applied
        if (document.body.classList.contains('rtl')) {
            console.log("Page loaded in Arabic mode - ensuring translations are applied");
            setTimeout(forceTranslateAllContent, 1000);
        }
    });
});

// Function to toggle language - called from the onclick attribute
function toggleLanguage() {
    console.log("Toggle language called");
    
    // Toggle rtl and arabic-font classes on body
    const isCurrentlyEnglish = !document.body.classList.contains('rtl');
    
    if (isCurrentlyEnglish) {
        // Switch to Arabic
        document.body.classList.add('rtl', 'arabic-font');
        
        // Update button text
        const langLabel = document.querySelector('.lang-label');
        if (langLabel) {
            langLabel.textContent = 'عربي → EN';
        }
        
        // Force translate after a short delay
        setTimeout(forceTranslateAllContent, 100);
    } else {
        // Switch back to English
        document.body.classList.remove('rtl', 'arabic-font');
        
        // Update button text
        const langLabel = document.querySelector('.lang-label');
        if (langLabel) {
            langLabel.textContent = 'EN → عربي';
        }
        
        // No need to force translate for English - the original HTML is already in English
    }
}

// EMERGENCY FUNCTIONS - Can be called from the browser console if needed
// Force Arabic mode
window.forceArabic = function() {
    document.body.classList.add('rtl', 'arabic-font');
    const langLabel = document.querySelector('.lang-label');
    if (langLabel) {
        langLabel.textContent = 'عربي → EN';
    }
    forceTranslateAllContent();
};

// Force English mode
window.forceEnglish = function() {
    document.body.classList.remove('rtl', 'arabic-font');
    const langLabel = document.querySelector('.lang-label');
    if (langLabel) {
        langLabel.textContent = 'EN → عربي';
    }
};

// Main translation function
function forceTranslateAllContent() {
    // Only translate if we're in Arabic mode
    if (document.body.classList.contains('rtl')) {
        console.log("Forcing Arabic translation of all content");
        
        // Header section elements
        translateByMapping({
            "Yusuf Morsi": "يوسف مرسي",
            "ML &commat; Cisco | ECE BS/MS @": "مهندس ذكاء اصطناعي في شركة سيسكو | بكالوريوس وماجستير في الهندسة الكهربائية @",
            "UC San Diego": "جامعة كاليفورنيا سان دييجو",
            "Prev @ FICO, Southwest Airlines, USC": "سابقاً في فيكو، طيران ساوث ويست، جامعة جنوب كاليفورنيا",
            "7x Hackathon Winner": "فائز في ٧ مسابقات برمجية"
        }, '#fh5co-header h1 span, #fh5co-header h3 span');
        
        // Job titles
        translateByMapping({
            "Data Scientist / FA Engineer": "عالم بيانات / مهندس تحليل الأعطال",
            "LLM Researcher": "باحث في نماذج اللغة الكبيرة",
            "Data Science Intern": "متدرب علوم البيانات",
            "Hardware Engineer Intern": "متدرب هندسة الأجهزة",
            "Software Engineer Intern": "متدرب هندسة البرمجيات",
            "Undergraduate Researcher": "باحث جامعي",
            "Research Assistant": "مساعد باحث",
            "Master of Science": "ماجستير العلوم",
            "Bachelor of Science": "بكالوريوس العلوم"
        }, '.timeline-title');
        
        // Companies/institutions
        translateByMapping({
            "Cisco": "سيسكو",
            "USC": "جامعة جنوب كاليفورنيا",
            "FICO": "فيكو",
            "Southwest Airlines": "طيران ساوث ويست",
            "CarsXE": "كارز إكس إي",
            "San Diego State University": "جامعة ولاية سان دييجو"
        }, '.institution-name');
        
        // Dates
        translateByMapping({
            "(Aug 2024 - Present) | San Jose, CA": "(أغسطس ٢٠٢٤ - حتى الآن) | سان خوسيه، كاليفورنيا",
            "(Sep 2024 - April 2025) | Los Angeles, CA": "(سبتمبر ٢٠٢٤ - أبريل ٢٠٢٥) | لوس أنجلوس، كاليفورنيا",
            "(2024) | San Diego, CA": "(٢٠٢٤) | سان دييجو، كاليفورنيا",
            "(2023) | San Jose, CA": "(٢٠٢٣) | سان خوسيه، كاليفورنيا",
            "(2023) | Dallas, TX": "(٢٠٢٣) | دالاس، تكساس",
            "(2022-2023) | Highland, MD": "(٢٠٢٢-٢٠٢٣) | هايلاند، ماريلاند",
            "Mobile Systems Design Lab (2022) | San Diego, CA": "مختبر تصميم الأنظمة المحمولة (٢٠٢٢) | سان دييجو، كاليفورنيا",
            "DigiHealth Lab (2021-2022) | San Diego, CA": "مختبر الصحة الرقمية (٢٠٢١-٢٠٢٢) | سان دييجو، كاليفورنيا",
            "Experimental Mechanics Lab (2019) | San Diego, CA": "مختبر الميكانيكا التجريبية (٢٠١٩) | سان دييجو، كاليفورنيا"
        }, '.company');
        
        // Job descriptions - exact phrases to catch
        translateByMapping({
            "Improving device failure analysis by leveraging data science techniques": 
            "تحسين تحليل أعطال الأجهزة باستخدام تقنيات علوم البيانات وأدوات مثل H2O.ai وواجهة برمجة تطبيقات OpenAI وتقنيات الذكاء الاصطناعي التوليدي الأخرى، مما يؤدي إلى تحديد أكثر دقة للأسباب الجذرية وتعزيز موثوقية أجهزة سيسكو.",
            
            "Optimizing query processing in large-scale databases": 
            "تحسين معالجة الاستعلامات في قواعد البيانات واسعة النطاق باستخدام خوارزميات التعلم الآلي المتقدمة",
            
            "Developing LLM-based model for query prediction": 
            "تطوير نموذج قائم على نماذج اللغة الكبيرة للتنبؤ بالاستعلامات واسترجاع البيانات",
            
            "Implemented various models": 
            "قمت بتنفيذ نماذج متنوعة (بما في ذلك تقدير الكثافة المعدل بالمصنف، الترميز التلقائي، غابة العزلة) لاكتشاف الشذوذ في درجات الاحتيال في بيانات المعاملات من البنوك الرئيسية في الولايات المتحدة والمملكة المتحدة وكندا والهند والبرازيل.",
            
            "Automated analysis process": 
            "أتمتة عملية التحليل من خلال تحليل وتجميع بيانات فشل الجهاز باستخدام H2O.ai وبايثون، مما يقلل بشكل كبير من وقت استكشاف الأخطاء وإصلاحها والتكاليف التشغيلية.",
            
            "Automated GTM workflows": 
            "أتمتة سير عمل GTM لـ Ansible Tower من خلال التطوير الشامل، مما يبسط سير العمل.",
            
            "On intern team tasked with saving": 
            "عضو في فريق المتدربين المكلف بتوفير ٢٤ مليون دولار سنويًا من خلال إطلاق ميزة الخصم بدلاً من الأطراف الثالثة (تم تقديمه إلى CIO).",
            
            "Led intern license plate recognition": 
            "قاد تنفيذ برنامج التعرف على لوحات الترخيص للمتدربين وتطوير حزمة pip لواجهة برمجة تطبيقات الشركة.",
            
            "R&D of iOS/Android apps": 
            "البحث والتطوير لتطبيقات iOS/Android التي تمكن التفاعل بين منصة التعلم الآلي والمرضى والأطباء.",
            
            "Developed I2C communication code": 
            "طورت رمز الاتصال I2C؛ صممت ولحمت الدوائر الكهربائية (مثل IMU).",
            
            "As a high school intern": 
            "كمتدرب في المدرسة الثانوية، بحثت في قوة الشد لعينات ABS ASTM D638 المطبوعة ثلاثية الأبعاد والمصنوعة بالقولبة بالحقن.",
            
            "Machine Learning and Data Science M.S.": 
            "ماجستير في التعلم الآلي وعلوم البيانات",
            
            "Electrical Engineering B.S.": 
            "بكالوريوس في الهندسة الكهربائية"
        }, '.timeline-body p');
        
        // Projects
        translateByMapping({
            "SeismicLSTM": "نموذج LSTM للبيانات الزلزالية",
            "VIAPF": "VIAPF",
            "ProstheTech": "تقنية الأطراف الصناعية",
            "Hate Speech NLP Analysis": "تحليل خطاب الكراهية باستخدام معالجة اللغة الطبيعية",
            "Visual-Intertial SLAM": "التموضع والخرائط المتزامنة البصرية القصورية",
            "Drowsiness Detection": "اكتشاف النعاس",
            "FaceFinder for NamUS": "باحث الوجوه لـ NamUS",
            "Ayatica": "آياتيكا"
        }, '#fh5co-work .work h3');
        
        // Project descriptions
        translateByMapping({
            "Mitigating the high computational costs": "تخفيف التكاليف الحسابية العالية المرتبطة بتطبيق تحديث النموذج البايزي في مشكلات عكسية / تحديد الكمي للشكوك وتحليل الحساسية الفعال باستخدام النماذج البديلة",
            "Trained and implemented autoencoder": "تدريب وتنفيذ الترميز التلقائي في خط أنابيب مع واجهة برمجة تطبيقات النسخ السحابية من Google لإزالة كل من الآلات الموسيقية والألفاظ النابية من الموسيقى.",
            "3D-printed EMG": "جهاز تخطيط كهربية العضلات مطبوع ثلاثي الأبعاد",
            "Detecting and analyzing hate speech": "اكتشاف وتحليل خطاب الكراهية",
            "Visual-Intertial SLAM with EKF": "التموضع والخرائط المتزامنة البصرية القصورية باستخدام مرشح كالمان الممتد وتتبع الميزات",
            "Drowsiness Detection with OpenCV": "اكتشاف النعاس باستخدام OpenCV وأردوينو",
            "Face and age recognition system": "نظام التعرف على الوجه والعمر للأشخاص المفقودين",
            "Exploring patterns, miracles": "استكشاف الأنماط والمعجزات والميزات اللغوية في النصوص الإسلامية المقدسة من خلال تصور البيانات"
        }, '#fh5co-work .work span');
        
        // Main section headings
        translateByMapping({
            "Relevant Experience": "الخبرات المهنية",
            "Work Experience": "الخبرة العملية",
            "Education": "التعليم",
            "Projects": "المشاريع"
        }, 'h2, h3');
        
        // Footer links
        translateByMapping({
            "Photography": "التصوير الفوتوغرافي",
            "Pre-GPT Portfolio": "النسخة الأولى من الموقع الشخصي"
        }, 'a.hover-underline-animation');
        
        console.log("Force translation complete");
    }
}

// Helper function to translate text using a mapping
function translateByMapping(mapping, selector) {
    document.querySelectorAll(selector).forEach(function(element) {
        const text = element.textContent.trim();
        
        // Look through each English phrase and see if it's in the text
        Object.keys(mapping).forEach(function(englishPhrase) {
            if (text.includes(englishPhrase)) {
                // Replace with Arabic translation
                element.textContent = mapping[englishPhrase];
            }
        });
    });
} 