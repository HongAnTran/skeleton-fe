import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Alert,
  Spin,
  Divider,
  Tag,
  Empty,
} from "antd";
import {
  SearchOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { KiotVietService } from "@/services/kiotviet.service";
import type { Invoice } from "@/types/kiotviet";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export const Route = createFileRoute("/warranty")({
  component: WarrantyLookupPage,
});

function WarrantyLookupPage() {
  const [form] = Form.useForm();
  const [searchResults, setSearchResults] = useState<Invoice[]>([]);

  const searchMutation = useMutation({
    mutationFn: (phoneOrSerial: string) => {
      return KiotVietService.searchInvoices(phoneOrSerial);
    },
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: () => {
      setSearchResults([]);
    },
  });

  const handleSearch = (values: { phoneOrSerial: string }) => {
    if (!values.phoneOrSerial?.trim()) {
      return;
    }
    searchMutation.mutate(values.phoneOrSerial.trim());
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Search Form */}
        <Card className="shadow-lg mb-8 border-0">
          <Form
            form={form}
            onFinish={handleSearch}
            layout="vertical"
            className="max-w-2xl mx-auto"
          >
            <Form.Item
              name="phoneOrSerial"
              label={
                <span className="text-base font-medium">
                  <PhoneOutlined className="mr-2" />
                  Số điện thoại hoặc Serial/IMEI
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
                placeholder="Nhập số điện thoại (0912345678) hoặc Serial/IMEI"
                prefix={<PhoneOutlined className="text-gray-400" />}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SearchOutlined />}
                loading={searchMutation.isPending}
                className="w-full h-12 text-lg font-medium rounded-lg"
              >
                Tra cứu
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Error Alert */}
        {searchMutation.isError && (
          <Alert
            message="Lỗi tra cứu"
            description={
              (searchMutation.error as any)?.message ||
              "Không thể kết nối tới hệ thống. Vui lòng thử lại sau."
            }
            type="error"
            showIcon
            className="mb-6"
            closable
          />
        )}

        {/* Loading State */}
        {searchMutation.isPending && (
          <div className="text-center py-12">
            <Spin size="large" />
            <div className="mt-4">
              <Text type="secondary">Đang tra cứu thông tin...</Text>
            </div>
          </div>
        )}

        {/* Results */}
        {!searchMutation.isPending &&
          !searchMutation.isError &&
          searchResults.length > 0 && (
            <div className="space-y-6 mt-4">
              {searchResults.map((invoice) => (
                <Card
                  key={invoice.id}
                  className="shadow-lg border-0 hover:shadow-xl transition-shadow"
                >
                  {/* Invoice Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b">
                    <div className="mb-2 sm:mb-0">
                      <Space>
                        <FileTextOutlined className="text-blue-500 text-xl" />
                        <Title level={4} className="!mb-0">
                          Hóa đơn: {invoice.code}
                        </Title>
                      </Space>
                    </div>
                  </div>

                  {/* Invoice Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <UserOutlined className="text-gray-400 mr-2" />
                        <Text strong>Khách hàng: </Text>
                        <Text className="ml-2">{invoice.customerName}</Text>
                      </div>
                      <div className="flex items-center">
                        <CalendarOutlined className="text-gray-400 mr-2" />
                        <Text strong>Ngày mua: </Text>
                        <Text className="ml-2">
                          {formatDate(invoice.createdDate)}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  {invoice.invoiceDetails &&
                    invoice.invoiceDetails.length > 0 && (
                      <div className="mb-6">
                        <Title level={5} className="!mb-3">
                          Sản phẩm:
                        </Title>
                        <div className="space-y-3">
                          {invoice.invoiceDetails.map((product, idx) => (
                            <Card
                              key={idx}
                              size="small"
                              className="bg-gray-50 border-gray-200"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1">
                                  <Text strong className="text-base block mb-1">
                                    {product.productName}
                                  </Text>
                                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                    <span>Mã SP: {product.productCode}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Warranty Info */}
                  {invoice.warranty && (
                    <>
                      <Divider className="!my-6" />
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                        <div className="flex items-center mb-4">
                          {invoice.warranty.status === "Còn hiệu lực" ? (
                            <CheckCircleOutlined className="text-green-500 text-2xl mr-3" />
                          ) : (
                            <CloseCircleOutlined className="text-red-500 text-2xl mr-3" />
                          )}
                          <Title level={4} className="!mb-0">
                            Thông tin bảo hành
                          </Title>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <Text
                                type="secondary"
                                className="text-sm block mb-1"
                              >
                                Loại bảo hành
                              </Text>
                              <Text strong className="text-base">
                                {invoice.warranty.warrantyType}
                              </Text>
                            </div>
                            <div>
                              <Text
                                type="secondary"
                                className="text-sm block mb-1"
                              >
                                Thời hạn bảo hành
                              </Text>
                              <Text strong className="text-base">
                                {invoice.warranty.warrantyDays} ngày
                              </Text>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Text
                                type="secondary"
                                className="text-sm block mb-1"
                              >
                                Ngày bắt đầu
                              </Text>
                              <Text strong className="text-base">
                                {formatDate(invoice.warranty.warrantyStartDate)}
                              </Text>
                            </div>
                            <div>
                              <Text
                                type="secondary"
                                className="text-sm block mb-1"
                              >
                                Ngày kết thúc
                              </Text>
                              <Text strong className="text-base">
                                {formatDate(invoice.warranty.warrantyEndDate)}
                              </Text>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="flex items-center justify-between">
                            <Text strong className="text-base">
                              Số ngày còn lại:
                            </Text>
                            <Tag
                              color={
                                invoice.warranty.status === "Còn hiệu lực"
                                  ? "success"
                                  : "error"
                              }
                              className="text-base px-3 py-1"
                            >
                              {invoice.warranty.remainingDays} ngày
                            </Tag>
                          </div>
                          <div className="mt-2">
                            <Tag
                              color={
                                invoice.warranty.status === "Còn hiệu lực"
                                  ? "success"
                                  : "error"
                              }
                              className="text-base px-3 py-1"
                            >
                              {invoice.warranty.status}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}

        {/* No Results */}
        {!searchMutation.isPending &&
          !searchMutation.isError &&
          searchResults.length === 0 &&
          searchMutation.isSuccess && (
            <Card className="shadow-lg border-0">
              <Empty
                description={
                  <Text type="secondary" className="text-base">
                    Không tìm thấy thông tin bảo hành. Vui lòng kiểm tra lại số
                    điện thoại hoặc Serial/IMEI.
                  </Text>
                }
              />
            </Card>
          )}
      </div>
    </div>
  );
}
