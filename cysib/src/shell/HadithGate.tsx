export function HadithGate({ onAffirm }: { onAffirm: () => void }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-start justify-center bg-[#091E42]/55 px-4 pt-[8vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hadith-title"
    >
      <article className="max-h-[84vh] w-full max-w-[600px] overflow-auto rounded-[3px] bg-white text-[#172B4D] shadow-[0_8px_12px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.31)]">
        <h2 id="hadith-title" className="border-b border-[#DFE1E6] px-6 py-4 text-[20px] font-medium">
          Before you open a work item
        </h2>
        <div className="px-6 py-5">
          <p className="text-[12px] text-[#626F86]">Sahih Muslim, from Abu Hurairah</p>
          <p className="mt-3 text-center font-['Amiri',serif] text-[2rem] leading-[1.7]" dir="rtl" lang="ar">
            مَنْ غَشَّ فَلَيْسَ مِنِّي
          </p>
          <p className="mt-1 text-center text-[18px] font-medium">Whoever cheats is not one of me.</p>
          <p className="mt-4 font-['Amiri',serif] text-[1.25rem] leading-[1.85] text-[#2C3E5D]" dir="rtl" lang="ar">
            مَرَّ رَسُولُ اللَّهِ ﷺ عَلَى صُبْرَةِ طَعَامٍ، فَأَدْخَلَ يَدَهُ فِيهَا، فَنَالَتْ أَصَابِعُهُ بَلَلًا، فَقَالَ: «مَا هَذَا يَا صَاحِبَ الطَّعَامِ؟» قَالَ: أَصَابَتْهُ السَّمَاءُ يَا رَسُولَ اللَّهِ. قَالَ: «أَفَلَا جَعَلْتَهُ فَوْقَ الطَّعَامِ كَيْ يَرَاهُ النَّاسُ؟ مَنْ غَشَّ فَلَيْسَ مِنِّي.»
          </p>
          <p className="mt-4 text-[14px] leading-6 text-[#172B4D]">
            The Messenger of Allah ﷺ passed by a pile of grain, put his hand into it, and felt that it was wet. He said, “What is this, owner of the food?” The man said, “Rain fell on it, Messenger of Allah.” He said, “Why did you not put it on top of the pile so people could see it? Whoever cheats is not one of me.”
          </p>
          <p className="mt-3 text-[14px] leading-6 text-[#44546F]">
            The top of the pile looked fine. Paid hours work the same way: what sits on the screen is what people are meant to trust. These are games. They are not a cover for time that belongs to someone else.
          </p>
        </div>
        <div className="flex justify-end border-t border-[#DFE1E6] px-6 py-4">
          <button
            type="button"
            onClick={onAffirm}
            className="rounded-[3px] bg-[#0C66E4] px-3 py-2 text-left text-[14px] font-medium leading-5 text-white hover:bg-[#0055CC]"
          >
            I am not cheating, and I am not taking time I have not earned
          </button>
        </div>
      </article>
    </div>
  )
}
