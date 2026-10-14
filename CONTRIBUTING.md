# دليل المساهمة في مشروع خُطى | Contributing Guide

نشكر اهتمامك بالمساهمة في مشروع **خُطى (Khuta)**! هذا الدليل يوضح معايير التطوير والمساهمة في المشروع.

---

## 🧭 المبادئ التوجيهية الأساسية | Guiding Principles

1. **التركيز على علم السلوك (Behavioral Science First):**
   - أي ميزة جديدة يجب أن تخدم الاستمرارية وتقليل الاحتكاك النفسي، وليس مجرد إضافة تعقيدات أو تنبيهات مزعجة.
2. **الحد الأدنى الواقعي (Micro-habits):**
   - نحرص دائماً على تمييز الإنجاز الكامل عن الحد الأدنى لدعم الأيام المزدحمة.
3. **الخصوصية التامة (Local-First):**
   - الحفاظ على بقاء بيانات المستخدم محلية وآمنة داخل متصفحه دون تتبع خارجي.

---

## 🛠️ بيئة التطوير المحلية | Local Development Setup

```bash
# 1. استنساخ المستودع
git clone https://github.com/Badr-Al-Zekri/khuta.git
cd khuta

# 2. تثبيت الحزم
npm install

# 3. تشغيل خادم التطوير
npm run dev

# 4. فحص الأخطاء والتوافق مع TypeScript
npm run lint

# 5. اختبار بناء نسخة الإنتاج
npm run build
```

---

## 🔀 نمط الفروع وإرسال التعديلات | Branch & PR Conventions

- أنشئ فرعاً جديداً لكل ميزة: `feature/your-feature-name` أو `fix/your-fix-name`.
- اكتب رسائل Commit واضحة بصيغة Conventional Commits (مثل: `feat: add habit archiving` أو `fix: correct streak count logic`).
- افتح Pull Request موضحاً التغييرات والاختبارات التي قمت بها.
