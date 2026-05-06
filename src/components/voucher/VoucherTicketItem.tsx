import type { VoucherDto } from "@/types/kiotviet";
import { CrownOutlined } from "@ant-design/icons";

const brown = {
  text: "text-[#3d2914]",
  muted: "text-[#3d2914]/65",
  solid: "bg-[#4a3221]",
  border: "border-[#d4c4a8]",
};

function formatDiscountShort(vnd: number): string {
  if (vnd >= 1_000_000 && vnd % 1_000_000 === 0) {
    return `${vnd / 1_000_000}tr`;
  }
  if (vnd >= 1_000 && vnd % 1_000 === 0) {
    return `${vnd / 1_000}K`;
  }
  return vnd.toLocaleString("vi-VN");
}

export interface VoucherTicketItemProps {
  voucher: VoucherDto;
  /** Hiển thị dòng điều kiện đơn tối thiểu (bên trái, dưới số giảm). API hiện không có — truyền khi có dữ liệu. */
  minOrderVnd?: number;
  /** HSD hiển thị dạng DD/MM/YYYY (API hiện không có). */
  expiryDateLabel?: string;
  /** Mô tả dưới tiêu đề. Mặc định theo mẫu. */
  description?: string;
  /** Nền “lỗ” tem vé (trùng nền vùng bọc ngoài). Mặc định trắng. */
  notchBackgroundClassName?: string;
  className?: string;
}

export function VoucherTicketItem({
  voucher,
  minOrderVnd,
  expiryDateLabel,
  description = "Áp dụng đơn hàng tiếp theo",
  notchBackgroundClassName = "bg-white",
  className = "",
}: VoucherTicketItemProps) {
  const showVip = true

  return (
    <div
      className={`flex min-h-[118px] overflow-hidden rounded-2xl border ${brown.border} bg-[#fef9f1] ${className}`}
    >
      {/* Cột trái — giảm giá */}
      <div
        className={`relative flex w-[30%] max-w-[140px] shrink-0 flex-col items-center justify-center gap-0.5 px-2 py-4 text-center sm:w-[28%] ${brown.text}`}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
          Giảm
        </span>
        <span className="text-2xl font-bold leading-tight tracking-tight sm:text-[1.65rem]">
          {formatDiscountShort(voucher.discountVnd)}
        </span>
        {minOrderVnd != null && minOrderVnd > 0 && (
          <span className="text-[11px] leading-snug sm:text-xs sm:whitespace-nowrap">
            đơn từ{" "}
            <br className="sm:hidden" />
            {formatDiscountShort(minOrderVnd)}
          </span>
        )}
        {/* Lỗ tem vé (nửa vòng) hai đầu khe chia */}
        <span
          className={`pointer-events-none absolute right-0 -top-2 z-[1] h-3 w-3 translate-x-1/2 rounded-full border ${brown.border} ${notchBackgroundClassName}`}
          aria-hidden
        />
        <span
          className={`pointer-events-none absolute right-0 -bottom-2 z-[1] h-3 w-3 translate-x-1/2 rounded-full border ${brown.border} ${notchBackgroundClassName}`}
          aria-hidden
        />
      </div>

      <div
        className={` w-0 shrink-0 border-l border-dashed ${brown.border}`}
        aria-hidden
      />

      {/* Cột phải — chi tiết */}
      <div className="relative flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 pr-3 sm:gap-4 sm:pl-5 sm:pr-4">
        <div className={`min-w-0 flex-1 ${brown.text}`}>
          {showVip && (
            <div
              className={`mb-1.5 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${brown.solid}`}
            >
              <CrownOutlined />
              VIP
            </div>
          )}
          <div className="text-sm font-bold leading-snug sm:text-[15px]">
            {voucher.label}
          </div>
          <div className={`mt-0.5 text-xs sm:text-[13px] ${brown.muted}`}>
            {description}
          </div>
          {expiryDateLabel ? (
            <div className={`mt-1 text-[11px] sm:text-xs ${brown.muted}`}>
              HSD: {expiryDateLabel}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
