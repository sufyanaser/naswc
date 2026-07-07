(() => {
  "use strict";

  const bio = "مهندس أنظمة وبرمجيات يمتلك خبرة تمتد لأكثر من 15 عاماً في هندسة الأنظمة، تطوير البرمجيات، وأتمتة العمليات، مع سجل عملي في تصميم وتشغيل أنظمة تعتمد على الاستقرار والاعتمادية في البيئات التشغيلية الحساسة. يقود NAS CodeWorks بمنهجية تركز على فهم سير العمل الفعلي داخل المؤسسات، ثم تحويله إلى تطبيقات سطح مكتب وأنظمة تشغيلية مخصصة بواجهات عربية واضحة، تساعد الشركات على تنظيم العمليات، تقليل العمل اليدوي، وتحسين كفاءة الأداء اليومي.";
  const stats = [
    ["15+", "سنة خبرة"],
    ["100%", "حلول مخصصة"],
    ["Problem-First", "منهجية عمل"]
  ];

  function apply() {
    const founder = document.querySelector(".founder");
    if (!founder || founder.dataset.copyFixed === "1") return;
    const p = founder.querySelector(".founder-txt p");
    const box = founder.querySelector(".founder-stats");
    if (p) p.textContent = bio;
    if (box) {
      box.innerHTML = stats.map(item => "<div><div class=\"n\">" + item[0] + "</div><div class=\"l\">" + item[1] + "</div></div>").join("");
    }
    founder.dataset.copyFixed = "1";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
})();
