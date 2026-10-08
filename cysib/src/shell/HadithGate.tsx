export function HadithGate({ onAffirm }: { onAffirm: () => void }) {
  return (
    <div
      className="absolute inset-0 z-50 grid place-items-center bg-[#1c1917]/55 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hadith-title"
    >
      <div className="max-h-full w-full max-w-xl overflow-auto rounded-2xl bg-white px-6 py-7 shadow-2xl sm:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#78716c]">Before you open anything</p>
        <h2
          id="hadith-title"
          className="mt-5 text-center font-['Amiri',serif] text-[34px] leading-[1.6] text-[#1c1917]"
          dir="rtl"
          lang="ar"
        >
          مَنْ غَشَّ فَلَيْسَ مِنِّي
        </h2>
        <p className="mt-2 text-center text-[20px] font-semibold leading-snug text-[#1c1917]">Whoever cheats is not one of me.</p>
        <p className="mt-6 font-['Amiri',serif] text-[20px] leading-[1.9] text-[#44403c]" dir="rtl" lang="ar">
          مَرَّ رَسُولُ اللَّهِ ﷺ عَلَى صُبْرَةِ طَعَامٍ، فَأَدْخَلَ يَدَهُ فِيهَا، فَنَالَتْ أَصَابِعُهُ بَلَلًا، فَقَالَ: «مَا هَذَا يَا صَاحِبَ الطَّعَامِ؟» قَالَ: أَصَابَتْهُ السَّمَاءُ يَا رَسُولَ اللَّهِ. قَالَ: «أَفَلَا جَعَلْتَهُ فَوْقَ الطَّعَامِ كَيْ يَرَاهُ النَّاسُ؟ مَنْ غَشَّ فَلَيْسَ مِنِّي.»
        </p>
        <p className="mt-4 text-[15px] leading-7 text-[#44403c]">
          The Messenger of Allah ﷺ passed by a pile of grain, put his hand into it, and felt that it was wet. He said, “What is this, owner of the food?” The man said, “Rain fell on it, Messenger of Allah.” He said, “Why did you not put it on top of the pile so people could see it? Whoever cheats is not one of me.”
        </p>
        <p className="mt-3 text-[13px] leading-5 text-[#78716c]">Abu Hurairah, Sahih Muslim.</p>
        <p className="mt-5 text-[15px] leading-7 text-[#292524]">
          The grain looked sound until a hand went underneath. Paid time is the same kind of trust. A window dressed up as work, while the person in the chair is not working, hides what is actually happening. These are games. They are not a cover for hours that belong to someone else.
        </p>
        <button
          type="button"
          onClick={onAffirm}
          className="mt-6 w-full rounded-xl bg-[#1c1917] px-4 py-3.5 text-[15px] font-semibold leading-snug text-white hover:bg-[#292524]"
        >
          I am not cheating, and I am not taking time I have not earned
        </button>
      </div>
    </div>
  )
}
