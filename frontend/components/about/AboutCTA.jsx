// components/about/AboutCTA.jsx

export default function AboutCTA() {
  return (
    <section className="mt-4 border-t border-neutral-200 pt-6">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-5 md:px-6 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-neutral-900 mb-1">
            อยากพัฒนาระบบต่อ หรือมีไอเดียเพิ่มเติม?
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl">
            หากคุณเป็นอาจารย์ เจ้าหน้าที่ หรือทีมพัฒนาจากคณะ/มหาวิทยาลัยอื่น
            ที่อยากนำแนวคิด NangNaiDee ไปต่อยอด
            สามารถติดต่อทีมงานเพื่อพูดคุยรายละเอียดได้
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-neutral-900 bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition"
        >
          <a href="https://github.com/suphanatchanlek30">ติดต่อทีมงาน</a>
        </button>
      </div>
    </section>
  );
}
