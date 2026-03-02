"use client";

import Link from "next/link";

export default function PrivacyPage() {
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
            <span className="text-white">Privacy Policy</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-[#f5f5f0]">
        <div className="mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="mb-12">
            <p className="text-sm text-amber-600 tracking-widest uppercase mb-2">
              Privacy Policy
            </p>
            <h1 className="text-3xl font-medium text-gray-900 mb-4">隱私權聲明</h1>
            <p className="text-sm text-gray-500">
              最後更新日期：{new Date().getFullYear()}年1月1日
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed mb-8">
              STS 顧問團隊（以下稱「本公司」或「STS」）重視您的個人資料保護與隱私權，並依據《個人資料保護法》及相關法規之要求，妥善蒐集、處理及利用您的個人資料。
              本聲明旨在說明本公司於您使用本網站服務時，如何蒐集、處理、利用及保護您的個人資料。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">一、適用範圍</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              本隱私權聲明適用於您在使用本公司網站（網址：sts.tw）及相關服務時，所涉及的個人資料蒐集、處理及利用行為。本聲明不適用於與本網站連結之其他第三方網站，該等網站之隱私保護措施，請參閱各該網站之隱私權政策。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">二、個人資料之蒐集方式與項目</h2>
            <p className="text-gray-600 leading-relaxed mb-4">本公司可能透過以下方式蒐集您的個人資料：</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>您於本網站填寫表單或註冊會員時主動提供之資料</li>
              <li>您與本公司人員聯繫時所提供之資料</li>
              <li>您參與本公司活動時所提供之資料</li>
              <li>透過 Cookies 等技術自動蒐集之資料</li>
            </ul>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">三、個人資料之使用目的</h2>
            <p className="text-gray-600 leading-relaxed mb-4">本公司蒐集您的個人資料，係基於以下目的：</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>提供諮詢服務與客戶管理</li>
              <li>行銷推廣與活動通知</li>
              <li>統計分析與服務改善</li>
              <li>履行法定義務</li>
            </ul>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">四、個人資料之利用期間、地區、對象及方式</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              您的個人資料將於蒐集之特定目的存續期間內，依法定或約定方式利用。本公司不會將您的個人資料轉讓予第三方，但依法律規定或您另行同意者，不在此限。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">五、個人資料之保護措施</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              本公司採取適當之技術與組織安全措施，以保護您的個人資料免於未經授權之存取、使用、修改或揭露。本公司員工及合作廠商均負有保密義務。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">六、您的權利</h2>
            <p className="text-gray-600 leading-relaxed mb-4">依據《個人資料保護法》，您對於您的個人資料享有以下權利：</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>查詢或請求閱覽</li>
              <li>請求製給複本</li>
              <li>請求補充或更正</li>
              <li>請求停止蒐集、處理或利用</li>
              <li>請求刪除</li>
            </ul>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">七、Cookies 政策</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              本網站使用 Cookies 技術以提升使用者體驗。Cookies 是一種儲存於您瀏覽器中的小型文字檔案，用於記錄您的偏好設定與瀏覽紀錄。您可透過瀏覽器設定拒絕或刪除 Cookies，但可能影響部分網站功能。
            </p>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">八、聯絡方式</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              如您對本隱私權聲明有任何疑問，或欲行使您的個人資料相關權利，請透過以下方式與我們聯繫：
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-6">
              <li>電子郵件：service@sts.tw</li>
              <li>電話：02-XXXX-XXXX</li>
              <li>地址：台北市中山區</li>
            </ul>

            <h2 className="text-xl font-medium text-gray-900 mt-8 mb-4">九、隱私權聲明之修訂</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              本公司保留隨時修訂本隱私權聲明之權利。修訂後之聲明將公布於本網站，並自公布日起生效。建議您定期查閱本聲明以了解最新內容。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
