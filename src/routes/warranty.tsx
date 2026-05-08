import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Form, Input, Button, Spin, Alert } from "antd";
import {
  SearchOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  InboxOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { KiotVietService } from "@/services/kiotviet.service";
import type { Invoice, SearchVouchersResponse } from "@/types/kiotviet";
import { VoucherTicketItem } from "@/components/voucher/VoucherTicketItem";
import dayjs from "dayjs";

export const Route = createFileRoute("/warranty")({
  component: WarrantyLookupPage,
});

function isPhoneNumber(input: string): boolean {
  const cleaned = input.replace(/[\s\-()]/g, "");
  return /^\d{9,11}$/.test(cleaned);
}

function WarrantyLookupPage() {
  const [form] = Form.useForm();
  const [searchResults, setSearchResults] = useState<Invoice[]>([]);
  const [voucherResult, setVoucherResult] =
    useState<SearchVouchersResponse | null>(null);

  const searchMutation = useMutation({
    mutationFn: (phoneOrSerial: string) =>
      KiotVietService.searchInvoices(phoneOrSerial),
    onSuccess: (data) => setSearchResults(data),
    onError: () => setSearchResults([]),
  });

  const voucherMutation = useMutation({
    mutationFn: (phone: string) => KiotVietService.searchVouchers(phone),
    onSuccess: (data) => setVoucherResult(data),
    onError: () => setVoucherResult(null),
  });

  const handleSearch = (values: { phoneOrSerial: string }) => {
    const input = values.phoneOrSerial?.trim();
    if (!input) return;
    searchMutation.mutate(input);
    if (isPhoneNumber(input)) {
      voucherMutation.mutate(input.replace(/[\s\-()]/g, ""));
    } else {
      setVoucherResult(null);
      voucherMutation.reset();
    }
  };

  const formatDate = (dateString: string) =>
    dayjs(dateString).format("DD/MM/YYYY HH:mm");

  const customerComment = voucherResult?.customerComments?.trim();

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        <div className="relative z-10 mx-auto max-w-5xl">
          {/* Search Card */}
          <div className="mx-auto max-w-2xl">
            <div
              className="rounded-3xl border border-[#d89b2b]/15 bg-[#fffaf0] p-6 sm:p-9"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            >
              <Form
                form={form}
                onFinish={handleSearch}
                layout="vertical"
                requiredMark={false}
              >
                <Form.Item
                  name="phoneOrSerial"
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Số điện thoại, Serial hoặc IMEI
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại hoặc Serial/IMEI",
                    },
                    {
                      min: 3,
                      message: "Vui lòng nhập ít nhất 3 ký tự",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Nhập SĐT, Serial hoặc IMEI"
                    prefix={<PhoneOutlined className="mr-1 text-gray-400" />}
                    className="!h-12 !rounded-xl !text-base"
                  />
                </Form.Item>

                <Form.Item className="!mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SearchOutlined />}
                    loading={searchMutation.isPending}
                    className="!h-12 w-full !rounded-xl !border-[#d89b2b] !bg-[#d89b2b] !text-base !font-semibold hover:!border-[#c0871f] hover:!bg-[#c0871f]"
                  >
                    Tra cứu
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>

          {/* Error */}
          {searchMutation.isError && (
            <div className="mx-auto mt-6 max-w-2xl">
              <Alert
                message="Lỗi tra cứu"
                description={
                  (searchMutation.error as any)?.message ||
                  "Không thể kết nối tới hệ thống. Vui lòng thử lại sau."
                }
                type="error"
                showIcon
                closable
              />
            </div>
          )}

          {/* Loading */}
          {searchMutation.isPending && (
            <div className="py-12 text-center">
              <Spin size="large" />
              <div className="mt-4 text-sm text-[#d6d6d6]">
                Đang tra cứu thông tin...
              </div>
            </div>
          )}

          {/* Voucher */}
          {!voucherMutation.isPending &&
            voucherMutation.isSuccess &&
            voucherResult?.voucher && (
              <div className="mx-auto mt-6 max-w-2xl">
                <p className="mb-3 text-center text-sm text-white">
                  Chúc mừng bạn đã nhận được voucher giảm giá
                </p>
                <VoucherTicketItem voucher={voucherResult.voucher} />
              </div>
            )}

          {!voucherMutation.isPending &&
            voucherMutation.isSuccess &&
            customerComment && (
              <div className="mx-auto mt-4 max-w-2xl">
                <div className="rounded-2xl border border-[#d4c4a8] bg-[#fef9f1] p-4 text-[#3d2914]">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-[#4a3221] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    <GiftOutlined />
                    Ưu đãi riêng
                  </div>
                  <div className="text-sm font-bold leading-snug sm:text-[15px]">
                    {customerComment}
                  </div>
                </div>
              </div>
            )}

          {/* Invoices */}
          {!searchMutation.isPending &&
            !searchMutation.isError &&
            searchResults.length > 0 && (
              <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-5">
                {searchResults.map((invoice) => (
                  <article
                    key={invoice.id}
                    className="rounded-2xl border border-[#e8e2d8] bg-[#fffaf0] p-5 sm:p-6"
                    style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.18)" }}
                  >
                    {/* Invoice Header */}
                    <header className="mb-4 flex flex-col gap-2 border-b border-[#e8e2d8] pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <FileTextOutlined className="text-xl text-[#d89b2b]" />
                        <h3 className="m-0 text-base font-semibold text-gray-900 sm:text-lg">
                          Hóa đơn: {invoice.code}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarOutlined />
                        <span>{formatDate(invoice.createdDate)}</span>
                      </div>
                    </header>

                    {/* Invoice Info */}
                    <div className="mb-5">
                      <div className="flex min-w-0 items-center gap-2 text-sm">
                        <UserOutlined className="text-gray-400" />
                        <span className="text-gray-500">Khách hàng:</span>
                        <span className="truncate font-medium text-gray-900">
                          {invoice.customerName}
                        </span>
                      </div>
                    </div>

                    {/* Products */}
                    {invoice.invoiceDetails &&
                      invoice.invoiceDetails.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Sản phẩm
                          </h4>
                          <div className="flex flex-col gap-2">
                            {invoice.invoiceDetails.map((product, idx) => (
                              <div
                                key={idx}
                                className="rounded-xl border border-[#ece6da] bg-[#fafafa] px-4 py-3"
                              >
                                <div className="break-words font-semibold text-gray-900">
                                  {product.productName}
                                </div>
                                <div className="mt-0.5 break-all text-sm text-gray-500">
                                  Mã SP: {product.productCode}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Warranty */}
                    {invoice.warranty ? (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          {invoice.warranty.status === "Còn hiệu lực" ? (
                            <CheckCircleOutlined className="text-2xl text-emerald-500" />
                          ) : (
                            <CloseCircleOutlined className="text-2xl text-red-500" />
                          )}
                          <h4 className="m-0 text-base font-semibold text-gray-900">
                            Thông tin bảo hành
                          </h4>
                          <span
                            className={`ml-auto rounded-full px-3 py-0.5 text-xs font-semibold ${invoice.warranty.status === "Còn hiệu lực"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                              }`}
                          >
                            {invoice.warranty.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {[
                            ["Loại bảo hành", invoice.warranty.warrantyType],
                            ["Thời hạn", `${invoice.warranty.warrantyDays} ngày`],
                            [
                              "Bắt đầu",
                              formatDate(invoice.warranty.warrantyStartDate),
                            ],
                            [
                              "Kết thúc",
                              formatDate(invoice.warranty.warrantyEndDate),
                            ],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {label}
                              </div>
                              <div className="mt-0.5 font-medium text-gray-900">
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-emerald-200/70 pt-4">
                          <span className="text-sm font-medium text-gray-700">
                            Số ngày còn lại
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${invoice.warranty.status === "Còn hiệu lực"
                              ? "bg-emerald-500 text-white"
                              : "bg-red-500 text-white"
                              }`}
                          >
                            {invoice.warranty.remainingDays} ngày
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-col items-center gap-1 rounded-xl border border-dashed border-[#e8e2d8] bg-white px-4 py-5 text-center">
                        <InboxOutlined className="text-2xl text-gray-400" />
                        <div className="font-medium text-gray-700">
                          Chưa có thông tin bảo hành
                        </div>
                        <div className="text-sm text-gray-500">
                          Vui lòng liên hệ shop để được hỗ trợ kiểm tra thêm.
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
        </div>
      </div>
    </div >
  );
}
