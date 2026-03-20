import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  Statistic,
  Row,
  Col,
  Alert,
  Spin,
  Empty,
  Tag,
  Typography,
  Space,
} from "antd";
import {
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { KiotVietService } from "@/services/kiotviet.service";
import type {
  KiotVietUser,
  Invoice,
  InvoicesByUserReport,
} from "@/types/kiotviet";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const Route = createFileRoute("/report/_reportLayout/kiotviet")({
  component: KiotVietReportPage,
});

function KiotVietReportPage() {
  const [form] = Form.useForm();
  const [userId, setUserId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[string, string] | null>([
    dayjs().startOf("day").toISOString(),
    dayjs().endOf("day").toISOString(),
  ]);

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["kiotviet-users"],
    queryFn: () =>
      KiotVietService.getUsers({
        pageSize: 100,
        orderBy: "givenName",
        orderDirection: "Asc",
      }),
    staleTime: Infinity,
  });

  const {
    data: invoicesData,
    isLoading: loadingInvoices,
    isFetching: fetchingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ["kiotviet-invoices-by-user", userId, dateRange],
    queryFn: () =>
      KiotVietService.getInvoicesByUser({
        userId: userId!,
        ...(dateRange?.[0] && { fromPurchaseDate: dateRange[0] }),
        ...(dateRange?.[1] && { toPurchaseDate: dateRange[1] }),
      }),
    enabled: !!userId,
    staleTime: 60 * 3 * 1000, // 3 minutes
  });

  const users: KiotVietUser[] = usersData?.data ?? [];
  const report: InvoicesByUserReport | undefined = invoicesData?.report;
  const invoices: Invoice[] = invoicesData?.data ?? [];

  const handleSearch = (values: {
    userId: number;
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
  }) => {
    setUserId(values.userId);
    setDateRange(
      values.dateRange
        ? [
            values.dateRange[0].startOf("day").toISOString(),
            values.dateRange[1].endOf("day").toISOString(),
          ]
        : null,
    );
  };

  const formatDate = (dateString: string) =>
    dayjs(dateString).format("DD/MM/YYYY HH:mm");
  const formatMoney = (n: number) => {
    const amount = n * 1000;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code: string) => (
        <Space>
          <FileTextOutlined className="text-gray-400" />
          <Text strong>{code}</Text>
        </Space>
      ),
    },
    {
      title: "Ngày bán",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (v: string) => (
        <Space>
          <CalendarOutlined className="text-gray-400" />
          {formatDate(v)}
        </Space>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      ellipsis: true,
      render: (v: string) => (
        <Space>
          <UserOutlined className="text-gray-400" />
          {v}
        </Space>
      ),
    },
    {
      title: "số lượng",
      dataIndex: "invoiceDetails",
      key: "invoiceDetails",
      width: 140,
      align: "right" as const,
      render: (v: any[]) => <Text strong>{v.length}</Text>,
    },
    {
      title: "Tổng thanh toán",
      dataIndex: "totalPayment",
      key: "totalPayment",
      width: 140,
      align: "right" as const,
      render: (v: number) => <Text strong>{formatMoney(v)}</Text>,
    },
    {
      title: "Bảo hành",
      key: "warranty",
      width: 110,
      render: (_: unknown, record: Invoice) =>
        record.warranty ? (
          <Tag
            icon={<SafetyCertificateOutlined />}
            color={
              record.warranty.status === "Còn hiệu lực" ? "green" : "default"
            }
          >
            {record.warranty.status}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  const warrantyBreakdownColumns = [
    {
      title: "Gói bảo hành",
      dataIndex: "warrantyType",
      key: "warrantyType",
      ellipsis: true,
      render: (v: string) => (
        <Space>
          <SafetyCertificateOutlined className="text-gray-400" />
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 110,
      align: "right" as const,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      width: 170,
      align: "right" as const,
      render: (v: number) => <Text strong>{formatMoney(v)}</Text>,
    },
  ];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-sm mb-6">
          <Title level={4} className="!mb-4">
            <TeamOutlined className="mr-2" />
            Báo cáo hóa đơn theo nhân viên
          </Title>
          <Form
            form={form}
            initialValues={{ dateRange: [dayjs(), dayjs()] }}
            onFinish={handleSearch}
            layout="inline"
            className="flex flex-wrap gap-3 items-end"
          >
            <Form.Item
              name="userId"
              rules={[{ required: true, message: "Chọn nhân viên" }]}
              className="!mb-0 lg:min-w-[320px] min-w-[300px]"
            >
              <Select
                placeholder="Chọn nhân viên"
                loading={loadingUsers}
                showSearch
                optionFilterProp="label"
                options={users.map((u) => ({
                  value: u.id,
                  label: `${u.givenName} (${u.userName})`,
                }))}
                suffixIcon={<UserOutlined className="text-gray-400" />}
                allowClear
              />
            </Form.Item>
            <Form.Item name="dateRange" className="!mb-0">
              <RangePicker
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                className="w-full"
              />
            </Form.Item>
            <Form.Item className="!mb-0 w-full lg:w-auto">
              <Button
                className="w-full lg:w-auto"
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                loading={fetchingInvoices && !!userId}
              >
                Xem báo cáo
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {invoicesError && (
          <Alert
            message="Không thể tải dữ liệu"
            description="Kiểm tra kết nối KiotViet hoặc thử lại sau."
            type="error"
            showIcon
            className="mb-6"
            closable
          />
        )}

        {loadingInvoices && userId && (
          <div className="flex justify-center py-12">
            <Spin size="large" tip="Đang tải hóa đơn..." />
          </div>
        )}

        {!loadingInvoices && userId && invoicesData && (
          <>
            <Row gutter={[16, 16]} className="mb-6 mt-6">
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <FileTextOutlined />
                        <span>Tổng số đơn</span>
                      </Space>
                    }
                    value={report?.totalOrders ?? 0}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <DollarOutlined />
                        <span>Doanh thu</span>
                      </Space>
                    }
                    value={report?.revenue ?? 0}
                    formatter={(v) => formatMoney(Number(v))}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <SafetyCertificateOutlined />
                        <span>Đơn có bảo hành</span>
                      </Space>
                    }
                    value={report?.warrantyOrderCount ?? 0}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <DollarOutlined />
                        <span>Doanh thu phụ kiện</span>
                      </Space>
                    }
                    value={report?.accessoryRevenue ?? 0}
                    formatter={(v) => formatMoney(Number(v))}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <SafetyCertificateOutlined />
                        <span>Doanh thu bảo hành</span>
                      </Space>
                    }
                    value={report?.warrantyRevenue ?? 0}
                    formatter={(v) => formatMoney(Number(v))}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" className="shadow-sm">
                  <Statistic
                    title={
                      <Space>
                        <SafetyCertificateOutlined />
                        <span>SL gói bảo hành</span>
                      </Space>
                    }
                    value={report?.warrantyQuantity ?? 0}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title={
                <Space>
                  <SafetyCertificateOutlined />
                  <span>Chi tiết gói bảo hành</span>
                  <Tag color="green">
                    {report?.warrantyBreakdown?.length ?? 0} loại
                  </Tag>
                </Space>
              }
              className="shadow-sm mb-6"
            >
              {report?.warrantyBreakdown?.length ? (
                <Table
                  rowKey={(r) => r.warrantyType}
                  dataSource={report.warrantyBreakdown}
                  columns={warrantyBreakdownColumns}
                  pagination={false}
                  size="small"
                  scroll={{ x: 650 }}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có gói bảo hành trong các hóa đơn đã lọc."
                />
              )}
            </Card>

            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <span>Danh sách hóa đơn</span>
                  <Tag color="blue">{invoices.length} đơn</Tag>
                </Space>
              }
              className="shadow-sm"
            >
              {invoices.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có hóa đơn trong khoảng thời gian đã chọn."
                />
              ) : (
                <Table
                  rowKey="id"
                  dataSource={invoices}
                  columns={columns}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (t) => `Tổng ${t} đơn`,
                  }}
                  size="middle"
                  scroll={{ x: 700 }}
                />
              )}
            </Card>
          </>
        )}

        {!userId && !loadingInvoices && (
          <Card className="shadow-sm">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chọn nhân viên và bấm «Xem báo cáo» để xem hóa đơn."
            />
          </Card>
        )}
      </div>
    </div>
  );
}
