"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="bg-[#0a0a0f]">
      {/* Header Space */}
      <div className="h-24" />

      {/* Breadcrumb */}
      <div className="bg-[#12121a] py-4">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex items-center gap-2 text-sm text-white/50">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Terms of Use</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-[#f5f5f0]">
        <div className="mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="mb-12">
            <p className="text-sm text-amber-600 tracking-widest uppercase mb-2">
              Terms of Use
            </p>
            <h1 className="text-3xl font-medium text-gray-900 mb-4">使用條款</h1>
            <p className="text-sm text-gray-500">
              最後更新日期：{new Date().getFullYear()}年1月1日
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed mb-8">
              本網站（以下稱「本網站」）由 STS 顧問團隊（以下稱「本公司」或「STS」）設立並維護。
              使用或瀏覽本網站，即表示您已閱讀、理解並同意遵守本使用條款。如您不同意，請立即停止使用本網站。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">一、適用範圍</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              本使用條款適用於您使用本網站及本公司所提供之所有服務。本公司保留隨時修改本條款之權利，修改後之條款將公布於本網站，不另行個別通知。您繼續使用本網站，即視為同意修改後之條款。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">二、內容之使用與限制</h2>
            <p className="text-gray-600 leading-relaxed mb-4">您同意在使用本網站時，不得有下列行為：</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>違反中華民國法律或國際法規</li>
              <li>侵害本公司或第三人之智慧財產權、隱私權或其他權利</li>
              <li>散布不實資訊、誹謗或中傷他人</li>
              <li>上傳或散布含有病毒或惡意程式之檔案</li>
              <li>未經授權存取本網站系統或資料</li>
              <li>干擾或破壞本網站之正常運作</li>
              <li>其他本公司認為不當之行為</li>
            </ul>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">三、智慧財產權聲明</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              本網站上所有內容，包括但不限於文字、圖片、影音、程式碼、商標、標誌等，均受著作權法及其他智慧財產權法規之保護，未經本公司書面同意，不得以任何形式複製、修改、散布、公開傳輸或為其他未經授權之使用。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">四、隱私權與資料保護</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              本公司重視您的隱私權保護，關於個人資料之蒐集、處理及利用，請參閱本公司之
              <Link href="/privacy" className="text-amber-600 hover:underline">
                隱私權聲明
              </Link>
              。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">五、免責聲明與責任限制</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              本網站所提供之資訊僅供參考，本公司不保證其正確性、完整性或即時性。對於下列情況，本公司不負任何責任：
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>因不可抗力或非可歸責於本公司之事由，導致服務中斷或資料遺失</li>
              <li>因您使用或無法使用本網站所生之任何損害</li>
              <li>因第三方網站連結所生之任何損害</li>
              <li>因您違反本條款所生之任何損害</li>
            </ul>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">六、終止使用</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              如您違反本使用條款之任何規定，本公司得隨時終止您使用本網站之權利，並保留追究法律責任之權利。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">七、準據法與管轄法院</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              本使用條款之解釋與適用，以中華民國法律為準據法。因本條款所生之爭議，雙方同意以台灣台北地方法院為第一審管轄法院。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">八、聯絡方式</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              如您對本使用條款有任何疑問，請透過以下方式與我們聯繫：
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-6">
              <li>電子郵件：service@sts.tw</li>
              <li>電話：02-XXXX-XXXX</li>
              <li>地址：台北市中山區</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
